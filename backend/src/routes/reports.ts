import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

const reports = await prisma.report.findMany({
  where: {
    OR: [
      { status: { not: "rezolvat" } },
      { resolvedAt: null },
      { resolvedAt: { gte: yesterday } },
    ],
  },
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

router.post("/", async (req, res) => {
  try {
    const { title, lat, lng, category, image } = req.body;

    const report = await prisma.report.create({
      data: {
        coordonateGPS: `${lat},${lng}`,
        categorie: category,
        descriere: title,
        foto: image || null,
        status: "nou",
        citizenId: 1,
      },
      include: {
        citizen: {
          include: {
            user: true,
          },
        },
      },
    });

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

router.patch("/:id/status", async (req, res) => {
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