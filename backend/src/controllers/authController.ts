import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'rezerva'

export const signup = async (req: Request, res: Response): Promise<void> => {
    const {nume, prenume, email, parola, adresa, telefon} = req.body;
    try{
        const hashedPassword = await bcrypt.hash(parola, 10);

        const newUser = await prisma.user.create({
            data:{
                nume, prenume, email,
                parola: hashedPassword,
                role: 'CETATEAN',
                citizen:{
                    create: {cnpVirtual: crypto.randomBytes(4).toString('hex'), adresa, telefon}
                }
            },
            include: {citizen: true}
        });

        const token = jwt.sign({userId: newUser.id, role: newUser.role}, JWT_SECRET, {expiresIn: '1d'});

        console.log(`Cont creat cu succes: ${email}`);
        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                nume: newUser.nume,
                prenume: newUser.prenume,
                email: newUser.email,
                role: newUser.role,
            }   
        });
    }
    catch(error: any){
        console.error(`Eroare la crearea contului: ${error.message}`);
        res.status(500).json({message: 'Eroare la crearea contului'});
    }   
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const {email, parola} = req.body;
    try{
        const user = await prisma.user.findUnique({where: {email}});
        if(!user){
            res.status(404).json({message: 'Utilizatorul nu a fost gasit'});
            return;
        }

        const isPasswordValid = await bcrypt.compare(parola, user.parola);
        if(!isPasswordValid){
            res.status(401).json({message: 'Parola incorecta'});
            return;
        }

        const token = jwt.sign({userId: user.id, role: user.role}, JWT_SECRET, {expiresIn: '1d'});

        console.log(`Utilizator autentificat cu succes: ${email}`);
        res.status(200).json({
            token,
            user: {
                id: user.id,
                nume: user.nume,
                prenume: user.prenume,
                email: user.email,
                role: user.role
            }
        });
    }
    catch(error: any){
        console.error(`Eroare la autentificarea utilizatorului: ${error.message}`);
        res.status(500).json({message: 'Eroare la autentificarea utilizatorului'});
    }
};