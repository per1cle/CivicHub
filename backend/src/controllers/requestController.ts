import type { Request, Response } from 'express';
import prisma from '../lib/prisma.js';

export const createRequest = async (req: Request, res: Response): Promise<void> => {
    // Acum req.body va exista sigur, pentru că Multer l-a parsat pentru noi!
    const { tip, emailCetatean, dateCompletate } = req.body;

    // Castăm request-ul pentru a include tipurile Multer pentru fișiere multiple (.array)
    const multerReq = req as Request & { files?: Express.Multer.File[] };

    // Extragem numele fișierelor salvate (dacă există) și le transformăm într-un string JSON
    const numeFisiere = multerReq.files && multerReq.files.length > 0
        ? JSON.stringify(multerReq.files.map(f => f.filename))
        : null;

    try {
        const user = await prisma.user.findUnique({
            where: { email: emailCetatean },
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
                citizenId: user.citizen.id
            }
        });

        res.status(201).json({ mesaj: "Cererea a fost înregistrată cu succes!", cerere: newRequest });
    } catch (error) {
        console.error("Eroare la crearea cererii:", error);
        res.status(500).json({ error: "Eroare internă a serverului." });
    }
};

export const getUserRequests = async (req: Request, res: Response): Promise<void> => {
    const email = req.params.email as string;

    try {
        const user = await prisma.user.findUnique({
            where: { email: email },
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
    const { status } = req.body;

    try {
        const updatedRequest = await prisma.request.update({
            where: { id: id },
            data: { status: status }
        });
        res.json({ mesaj: "Status actualizat cu succes!", cerere: updatedRequest });
    } catch (error) {
        console.error("Eroare la actualizarea statusului:", error);
        res.status(500).json({ error: "Eroare la actualizarea cererii." });
    }
};