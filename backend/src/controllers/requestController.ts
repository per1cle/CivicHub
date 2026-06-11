import type { Response } from 'express';
import prisma from '../lib/prisma.js';
import { sendNotification } from '../services/notificationService.js';
import { type AuthRequest } from '../middleware/auth.js';

export const createRequest = async (req: AuthRequest, res: Response): Promise<void> => {
    // Acum req.body va exista sigur, pentru că Multer l-a parsat pentru noi!
    const { tip, dateCompletate } = req.body;
    const userIdFromToken = req.user?.userId;

    // Castăm request-ul pentru a include tipurile Multer pentru fișiere multiple (.array)
    const multerReq = req as AuthRequest & { files?: Express.Multer.File[] };

    // Extragem numele fișierelor salvate (dacă există) și le transformăm întrun string JSON
    const numeFisiere = multerReq.files && multerReq.files.length > 0
        ? JSON.stringify(multerReq.files.map(f => f.filename))
        : null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userIdFromToken },
            include: { citizen: true }
        });

        if (!user || !user.citizen) {
            res.status(404).json({ error: "Cetățeanul nu a fost găsit." });
            return;
        }

        const newRequest = await prisma.request.create({
            data: {
                tip,
                fisierAtasat: numeFisiere,
                dateCompletate: dateCompletate || null,
                citizenId: user.citizen.id
            }
        });

        // Notificăm oficialii despre noua cerere
        const officials = await prisma.official.findMany({ include: { user: true } });
        for (const official of officials) {
            await sendNotification(
                official.userId,
                "Cerere Nouă",
                `A fost depusă o cerere nouă de tip "${tip}" de către ${user.nume} ${user.prenume}.`,
                "CERERE"
            );
        }

        res.status(201).json({ mesaj: "Cererea a fost înregistrată cu succes!", cerere: newRequest });
    } catch (error) {
        console.error("Eroare la crearea cererii:", error);
        res.status(500).json({ error: "Eroare internă a serverului." });
    }
};

export const getUserRequests = async (req: AuthRequest, res: Response): Promise<void> => {
    const userIdFromToken = req.user?.userId;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userIdFromToken },
            include: { citizen: true }
        });

        if (!user || !user.citizen) {
            res.status(404).json({ error: "Cetățeanul nu a fost găsit." });
            return;
        }

        const userRequests = await prisma.request.findMany({
            where: { citizenId: user.citizen.id },
            orderBy: { dataDepunere: 'desc' }
        });

        res.json(userRequests);
    } catch (error) {
        res.status(500).json({ error: "Eroare la preluarea cererilor." });
    }
};

export const getAllRequests = async (req: Request, res: Response): Promise<void> => {
    try {
        const allRequests = await prisma.request.findMany({
            include: { citizen: { include: { user: true } } }, // Includem datele cetățeanului și ale utilizatorului pentru a-i afișa numele
            orderBy: { dataDepunere: 'desc' }
        });
        res.json(allRequests);
    } catch (error) {
        console.error("Eroare la preluarea tuturor cererilor:", error);
        res.status(500).json({ error: "Eroare la preluarea cererilor." });
    }
};

// Actualizează statusul unei cereri
export const updateRequestStatus = async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(req.params.id as string, 10);
    const { status, motivRespingere } = req.body;

    try {
        const updatedRequest = await prisma.request.update({
            where: { id: id },
            data: { 
                status: status,
                motivRespingere: status === "Respins" ? motivRespingere : null
            },
            include: { citizen: { include: { user: true } } }
        });

        // Notificăm cetățeanul despre schimbarea statusului
        if (updatedRequest.citizen.user) {
            let notificationTitle = "Actualizare Status Cerere";
            let notificationMessage = `Statusul cererii dumneavoastră pentru "${updatedRequest.tip}" a fost actualizat în: ${status}.`;
            
            if (status === "Respins" && motivRespingere) {
                notificationTitle = "Dosar Respins - Necesită Corecții";
                notificationMessage = `Din păcate, dosarul dumneavoastră pentru "${updatedRequest.tip}" a fost respins. Motiv: ${motivRespingere}. Vă rugăm să retrimiteți cererea cu documentele corectate.`;
            } else if (status === "Aprobat") {
                notificationTitle = "Dosar Aprobat - CivicHub";
                notificationMessage = `Felicitări! Dosarul dumneavoastră pentru "${updatedRequest.tip}" a fost verificat și aprobat. Puteți ridica documentele sau urmări pașii următori în contul dumneavoastră.`;
            }

            await sendNotification(
                updatedRequest.citizen.user.id,
                notificationTitle,
                notificationMessage,
                "CERERE",
                updatedRequest.citizen.user.email // Trimitem și email cetățeanului
            );
        }

        res.json({ mesaj: "Status actualizat cu succes!", cerere: updatedRequest });
    } catch (error) {
        console.error("Eroare la actualizarea statusului:", error);
        res.status(500).json({ error: "Eroare la actualizarea cererii." });
    }
};