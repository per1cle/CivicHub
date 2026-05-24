import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  const payments = await prisma.payment.findMany({
    orderBy: { dueDate: "asc" },
  });

  res.json(payments);
});

router.patch("/:id/pay", async (req, res) => {
  const id = Number(req.params.id);

  const payment = await prisma.payment.update({
    where: { id },
    data: {
      status: "platit",
      paidDate: new Date(),
      receiptCode: `CH-${new Date().getFullYear()}-${String(id).padStart(4, "0")}`,
    },
  });

  res.json(payment);
});

export default router;