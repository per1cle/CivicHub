import { Router } from "express";
import prisma from "../lib/prisma.js";
import { sendNotification } from "../services/notificationService.js";
import { authenticateToken, authorizeRoles, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  const { userId } = req.query;
  try {
    const parsedUserId = userId ? Number(userId) : NaN;
    
    // Dacă nu e funcționar și încearcă să vadă programările altuia sau toate programările
    if (req.user?.role !== "FUNCTIONAR" && (isNaN(parsedUserId) || parsedUserId !== req.user?.userId)) {
      return res.status(403).json({ message: "Acces interzis." });
    }

    const whereClause = !isNaN(parsedUserId) ? {
      citizen: {
        userId: parsedUserId
      }
    } : {};

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      orderBy: { dataOra: "asc" },
      include: {
        citizen: {
          include: {
            user: {
              select: {
                id: true,
                nume: true,
                prenume: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Eroare la încărcarea programărilor." });
  }
});

router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { date, time, service, notes } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Utilizator neautorizat." });
    }

    const citizen = await prisma.citizen.findUnique({
      where: { userId: Number(userId) }
    });

    if (!citizen) {
      return res.status(404).json({ message: "Cetățeanul nu a putut fi identificat." });
    }

    const appointment = await prisma.appointment.create({
      data: {
        dataOra: new Date(`${date}T${time}:00`),
        serviciuAles: service,
        observatii: notes,
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

    // Notificăm cetățeanul despre confirmarea programării
    if (appointment.citizen.user) {
      const formattedDate = new Date(date).toLocaleDateString('ro-RO', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
      
      await sendNotification(
        appointment.citizen.user.id,
        "Confirmare Programare CivicHub",
        `Bună ziua, ${appointment.citizen.user.prenume}! Programarea dumneavoastră pentru serviciul "${service}" a fost înregistrată cu succes pe data de ${formattedDate}, la ora ${time}. Vă așteptăm la sediul primăriei.`,
        "PROGRAMARE",
        appointment.citizen.user.email
      );
    }

    // Notificăm oficialii despre noua programare
    const officials = await prisma.official.findMany({ include: { user: true } });
    for (const official of officials) {
      await sendNotification(
        official.userId,
        "Programare Nouă",
        `O programare nouă a fost creată pentru serviciul "${service}" pe data de ${date}, la ora ${time}.`,
        "PROGRAMARE"
      );
    }

    res.status(201).json(appointment);
  } catch (error) {
    console.error("POST Appointment Error:", error);
    res.status(500).json({ message: "Eroare la crearea programării." });
  }
});

router.patch("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { date, time, service, notes } = req.body;
    const appointmentId = Number(req.params.id);

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { citizen: true }
    });

    if (!existingAppointment) {
      return res.status(404).json({ message: "Programarea nu există." });
    }

    if (existingAppointment.citizen.userId !== req.user?.userId && req.user?.role !== "FUNCTIONAR") {
      return res.status(403).json({ message: "Acces interzis." });
    }

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        dataOra: new Date(`${date}T${time}:00`),
        serviciuAles: service,
        observatii: notes,
      },
      include: {
        citizen: {
          include: {
            user: true,
          },
        },
      },
    });

    // Notificăm cetățeanul despre reprogramare
    if (appointment.citizen.user) {
      await sendNotification(
        appointment.citizen.user.id,
        "Reprogramare",
        `Programarea dumneavoastră a fost modificată pentru data de ${date}, ora ${time}.`,
        "PROGRAMARE",
        appointment.citizen.user.email
      );
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Eroare la reprogramare." });
  }
});

router.delete("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const appointmentId = Number(req.params.id);
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        citizen: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!appointment) {
      return res.status(404).json({ message: "Programarea nu există." });
    }

    if (appointment.citizen.userId !== req.user?.userId && req.user?.role !== "FUNCTIONAR") {
      return res.status(403).json({ message: "Acces interzis." });
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: "anulata" }
    });

    // Notificăm cetățeanul despre anulare (doar in-app, fără email conform solicitării)
    if (appointment.citizen.user) {
      await sendNotification(
        appointment.citizen.user.id,
        "Programare Anulată",
        `Programarea dumneavoastră pentru "${appointment.serviciuAles}" a fost anulată.`,
        "PROGRAMARE"
        // Nu trimitem email aici
      );
    }

    res.json({ message: "Programare anulată" });
  } catch (error) {
    console.error("DELETE Error:", error);
    res.status(500).json({ message: "Eroare la anularea programării." });
  }
});

export default router;