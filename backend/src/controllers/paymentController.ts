import type { Response } from 'express';
import prisma from '../lib/prisma.js';
import { sendNotification } from '../services/notificationService.js';
import { type AuthRequest } from '../middleware/auth.js';

// 1. Aducem toate plățile (Acum includem și datele cetățeanului pentru admin)
export const getAllPayments = async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId } = req.query;

    try {
        let targetUserId: number | undefined;
        
        if (req.user?.role === "FUNCTIONAR") {
            targetUserId = userId ? Number(userId) : undefined;
        } else {
            targetUserId = req.user?.userId;
        }

        const whereClause = targetUserId ? {
            citizen: {
                userId: targetUserId
            }
        } : {};

        const payments = await prisma.payment.findMany({
            where: whereClause,
            include: {
                citizen: {
                    include: { user: true } // Aducem și userul ca să îi afișăm numele în frontend
                }
            },
            orderBy: { dueDate: "asc" },
        });
        res.json(payments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Eroare la preluarea plăților." });
    }
};

// 2. Funcția ta existentă de plată
export const payPayment = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    try {
        const payment = await prisma.payment.update({
            where: { id },
            data: {
                status: "platit",
                paidDate: new Date(),
                receiptCode: `CH-${new Date().getFullYear()}-${String(id).padStart(4, "0")}`,
            },
            include: {
                citizen: {
                    include: { user: true }
                }
            }
        });

        // Notificăm cetățeanul despre confirmarea plății
        if (payment.citizen.user) {
            await sendNotification(
                payment.citizen.user.id,
                "Confirmare Plată",
                `Plata pentru "${payment.title}" în valoare de ${payment.amount} RON a fost procesată cu succes. Codul chitanței dumneavoastră este: ${payment.receiptCode}.`,
                "PLATA",
                payment.citizen.user.email
            );
        }

        res.json(payment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Eroare la procesarea plății." });
    }
};

// 3. NOU: Funcția pentru admin ca să emită o taxă nouă
export const issuePayment = async (req: Request, res: Response): Promise<void> => {
    // Extragem ambele variante posibile pentru siguranță
    const cnp = req.body.cnp || req.body.cnpVirtual;
    const { title, amount, category, dueDate } = req.body;

    // 1. Validare de siguranță: Ne asigurăm că primim CNP-ul înainte să întrebăm baza de date
    if (!cnp) {
        res.status(400).json({ error: "Eroare: CNP-ul nu a ajuns la server!" });
        return;
    }

    try {
        // 2. Căutăm cetățeanul
        const citizen = await prisma.citizen.findUnique({
            where: { cnpVirtual: cnp }
        });

        if (!citizen) {
            res.status(404).json({ error: "Nu a fost găsit niciun cetățean cu acest CNP Virtual." });
            return;
        }

        // 3. Creăm taxa (ne asigurăm că amount e număr și dueDate e dată validă)
        const newPayment = await prisma.payment.create({
            data: {
                title,
                amount: Number(amount),
                category,
                dueDate: new Date(dueDate),
                status: "neplatit",
                citizenId: citizen.id
            }
        });

        const user = await prisma.user.findUnique({ where: { id: citizen.userId } });

        if (user) {
            await sendNotification(
                user.id,
                "Obligație Fiscală Nouă",
                `A fost emisă o nouă plată pentru: ${title}. Suma de plată este de ${amount} RON, cu scadența la ${new Date(dueDate).toLocaleDateString('ro-RO')}.`, // Mesajul
                "PLATA", // Tipul notificării
                user.email // Trimitere și pe email!
            );
        }

        res.status(201).json(newPayment);
    } catch (error) {
        console.error("Eroare la emiterea taxei:", error);
        res.status(500).json({ error: "Eroare internă la emiterea taxei." });
    }
};

export const sendPaymentReminder = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    try {
        // 1. Căutăm plata și aducem automat și datele cetățeanului/userului
        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                citizen: {
                    include: { user: true }
                }
            }
        });

        if (!payment || !payment.citizen.user) {
            res.status(404).json({ error: "Plata sau utilizatorul nu a putut fi găsit." });
            return;
        }

        const { user } = payment.citizen;
        const isOverdue = new Date(payment.dueDate) < new Date();
        const scurgere = isOverdue ? "a expirat la" : "este la";

        // 2. Trimitem notificarea și emailul
        await sendNotification(
            user.id,
            "Avertizare: Memento de Plată",
            `Vă reamintim că figurați cu o obligație de plată neachitată pentru "${payment.title}", în valoare de ${payment.amount} RON. Termenul limită ${scurgere} data de ${new Date(payment.dueDate).toLocaleDateString('ro-RO')}. Vă rugăm să achitați suma pentru a evita eventuale penalizări.`,
            "PLATA",
            user.email
        );

        res.json({ success: true, message: "Memento trimis cu succes" });
    } catch (error) {
        console.error("Eroare la trimiterea mementoului:", error);
        res.status(500).json({ error: "Eroare internă la trimiterea mementoului." });
    }
};