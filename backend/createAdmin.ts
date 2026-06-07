import prisma from './src/lib/prisma.js';
import bcrypt from 'bcrypt';

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash("parola123", 10);
    const admin = await prisma.user.create({
      data: {
        nume: "Admin",
        prenume: "Șef",
        email: "admin@test.ro",
        parola: hashedPassword,
        role: "FUNCTIONAR",
        official: {
          create: { departament: "Gestionare Platformă", gradAcces: 1 }
        }
      }
    });
    console.log("✅ Contul admin a fost creat. Te poți loga cu admin@test.ro / parola123");
  } catch (error) {
    console.error("Eroare:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();