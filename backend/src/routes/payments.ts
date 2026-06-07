import { Router } from "express";
import { getAllPayments, payPayment, issuePayment, sendPaymentReminder } from "../controllers/paymentController.js";

const router = Router();

router.get("/", getAllPayments);
router.patch("/:id/pay", payPayment);
router.post("/issue", issuePayment);
router.post("/:id/reminder", sendPaymentReminder);

export default router;