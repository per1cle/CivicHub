import { Router } from "express";
import { getAllPayments, payPayment, issuePayment, sendPaymentReminder } from "../controllers/paymentController.js";
import { authenticateToken, authorizeRoles } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, getAllPayments);
router.patch("/:id/pay", authenticateToken, payPayment);
router.post("/issue", authenticateToken, authorizeRoles("FUNCTIONAR"), issuePayment);
router.post("/:id/reminder", authenticateToken, authorizeRoles("FUNCTIONAR"), sendPaymentReminder);

export default router;