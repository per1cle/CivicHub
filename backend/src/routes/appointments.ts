import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      orderBy: { dataOra: "asc" },
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Eroare la încărcarea programărilor." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { date, time, service, notes, citizenId } = req.body;

    const appointment = await prisma.appointment.create({
      data: {
        dataOra: new Date(`${date}T${time}:00`),
        serviciuAles: service,
        observatii: notes,
        citizenId: Number(citizenId),
      },
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Eroare la crearea programării." });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { date, time, service, notes } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id: Number(req.params.id) },
      data: {
        dataOra: new Date(`${date}T${time}:00`),
        serviciuAles: service,
        observatii: notes,
      },
    });

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Eroare la reprogramare." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.appointment.delete({
      where: { id: Number(req.params.id) },
    });

    res.json({ message: "Programare anulată" });
  } catch (error) {
    res.status(500).json({ message: "Eroare la anularea programării." });
  }
});

export default router;