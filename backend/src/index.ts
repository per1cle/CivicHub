import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import prisma from './lib/prisma.js';
import reportRoutes from "./routes/reports.js";
import appointmentRoutes from "./routes/appointments.js";
import paymentRoutes from "./routes/payments.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/payments", paymentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});