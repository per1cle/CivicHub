import nodemailer from 'nodemailer';
import prisma from '../lib/prisma.js';

// Configurarea contului de email (Ideal e să folosești un App Password de la un cont de Gmail de test)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Creează o notificare in-app și trimite automat un email.
 */
export const sendNotification = async (
    userId: number,
    title: string,
    message: string,
    type: string,
    emailTo?: string // Opțional: dacă îl pui, trimite și email, nu doar notificare in-app
) => {
    try {
        // 1. Salvăm notificarea în baza de date pentru a apărea în aplicație
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type
            }
        });

        // 2. Dacă am primit o adresă de email, trimitem și mesajul pe mail
        if (emailTo) {
            await transporter.sendMail({
                from: '"CivicHub Notificări" <no-reply@civichub.ro>',
                to: emailTo,
                subject: `CivicHub: ${title}`,
                html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">${title}</h2>
            <p style="font-size: 16px; line-height: 1.5;">${message}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888;">Acesta este un mesaj generat automat de platforma CivicHub.</p>
          </div>
        `
            });
        }

        return notification;
    } catch (error) {
        console.error("Eroare la trimiterea notificării:", error);
        // Nu aruncăm eroarea mai departe pentru a nu bloca fluxul principal al aplicației
    }
};