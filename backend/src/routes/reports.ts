import { Router } from "express";
import prisma from "../lib/prisma.js";
import { sendNotification } from "../services/notificationService.js";
import { authenticateToken, authorizeRoles, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { userId } = req.query;
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const whereClause: any = {
      AND: [
        {
          OR: [
            { status: { not: "rezolvat" } },
            { resolvedAt: null },
            { resolvedAt: { gte: yesterday } },
          ],
        }
      ]
    };

    // Aplicăm filtrul de user DOAR dacă avem un ID valid
    let targetUserId: number | undefined;
    if (req.user?.role === "FUNCTIONAR") {
      targetUserId = userId ? Number(userId) : undefined;
    } else {
      // Pentru cetățeni, filtrăm după ID-ul lor dacă vor să vadă doar sesizările proprii
      if (userId) {
        targetUserId = req.user?.userId;
      }
    }

    if (targetUserId) {
      whereClause.AND.push({ citizen: { userId: targetUserId } });
    }

    const reports = await prisma.report.findMany({
      where: whereClause,
      include: {
        citizen: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    const mappedReports = reports.map((report) => {
      const [lat, lng] = report.coordonateGPS.split(",").map(Number);

      return {
        id: report.id,
        title: report.descriere,
        lat,
        lng,
        status: report.status,
        category: report.categorie,
        priority: "medie",
        citizenName: `${report.citizen.user.nume} ${report.citizen.user.prenume}`,
        createdAt: new Date().toISOString().slice(0, 10),
        image: report.foto || undefined,
        resolvedAt: report.resolvedAt,
      };
    });

    res.json(mappedReports);
  } catch (error) {
    console.error("Eroare GET reports:", error);
    res.status(500).json({ message: "Eroare la încărcarea sesizărilor." });
  }
});

router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, lat, lng, category, image } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Utilizator neautorizat." });
    }

    const citizen = await prisma.citizen.findUnique({
      where: { userId: Number(userId) }
    });

    if (!citizen) {
      return res.status(404).json({ message: "Cetățeanul nu a fost găsit." });
    }

    const report = await prisma.report.create({
      data: {
        coordonateGPS: `${lat},${lng}`,
        categorie: category,
        descriere: title,
        foto: image || null,
        status: "nou",
        citizenId: citizen.id,
      },
      include: {
        citizen: {
          include: {
            user: true,
          },
        },
      },
    });

    // Notificăm oficialii despre noua sesizare
    const officials = await prisma.official.findMany({ include: { user: true } });
    for (const official of officials) {
      await sendNotification(
        official.userId,
        "Sesizare Nouă",
        `O sesizare nouă a fost adăugată în categoria "${category}": ${title}`,
        "SESIZARE"
      );
    }

    const [savedLat, savedLng] = report.coordonateGPS.split(",").map(Number);

    res.status(201).json({
      id: report.id,
      title: report.descriere,
      lat: savedLat,
      lng: savedLng,
      status: report.status,
      category: report.categorie,
      priority: "medie",
      citizenName: `${report.citizen.user.nume} ${report.citizen.user.prenume}`,
      createdAt: new Date().toISOString().slice(0, 10),
      image: report.foto || undefined,
      resolvedAt: report.resolvedAt,
    });
  } catch (error) {
    console.error("Eroare POST reports:", error);
    res.status(500).json({ message: "Eroare la crearea sesizării." });
  }
});

router.patch("/:id/status", authenticateToken, authorizeRoles("FUNCTIONAR"), async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;

    const report = await prisma.report.update({
      where: { id: Number(req.params.id) },
      data: {
        status,
        resolvedAt: status === "rezolvat" ? new Date() : null,
      },
      include: {
        citizen: {
          include: {
            user: true,
          },
        },
      },
    });

    // Notificăm cetățeanul despre schimbarea statusului sesizării
    if (report.citizen.user) {
      await sendNotification(
        report.citizen.user.id,
        "Actualizare Status Sesizare",
        `Statusul sesizării dumneavoastră ("${report.descriere}") a fost actualizat în: ${status}.`,
        "SESIZARE",
        report.citizen.user.email
      );
    }

    const [lat, lng] = report.coordonateGPS.split(",").map(Number);

    res.json({
      id: report.id,
      title: report.descriere,
      lat,
      lng,
      status: report.status,
      category: report.categorie,
      priority: "medie",
      citizenName: `${report.citizen.user.nume} ${report.citizen.user.prenume}`,
      createdAt: new Date().toISOString().slice(0, 10),
      image: report.foto || undefined,
      resolvedAt: report.resolvedAt,
    });
  } catch (error) {
    console.error("Eroare PATCH reports:", error);
    res.status(500).json({ message: "Eroare la actualizarea statusului." });
  }
});

export default router;