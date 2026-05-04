import { Router } from 'express';
import { signup, login } from '../controllers/authController.js';

const router = Router();

// "Harta" noastră e mult mai ușor de citit!
router.post('/signup', signup);
router.post('/login', login);

export default router;