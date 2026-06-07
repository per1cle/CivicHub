import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

// Aducem notificările userului logat (pe baza ID-ului din query sau token)
router.get("/:userId", async (req, res) => {
    const userId = Number(req.params.userId);
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20 // Aducem doar ultimele 20
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: "Eroare la preluare notificări" });
    }
});

// Marcăm o notificare ca citită
router.patch("/:id/read", async (req, res) => {
    const id = Number(req.params.id);
    try {
        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Eroare la actualizare" });
    }
});

export default router;