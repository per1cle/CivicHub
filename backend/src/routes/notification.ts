import { Router } from "express";
import prisma from "../lib/prisma.js";
import { authenticateToken, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// Aducem notificările userului logat (pe baza ID-ului din query sau token)
router.get("/:userId", authenticateToken, async (req: AuthRequest, res) => {
    const userId = Number(req.params.userId);

    if (req.user?.userId !== userId && req.user?.role !== "FUNCTIONAR") {
        return res.status(403).json({ message: "Acces interzis." });
    }

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
router.patch("/:id/read", authenticateToken, async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    try {
        const notification = await prisma.notification.findUnique({
            where: { id }
        });

        if (!notification || (notification.userId !== req.user?.userId && req.user?.role !== "FUNCTIONAR")) {
            return res.status(403).json({ message: "Acces interzis." });
        }

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