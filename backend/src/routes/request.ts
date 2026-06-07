import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { createRequest, getAllRequests, getUserRequests, updateRequestStatus } from '../controllers/requestController.js';

const router = Router();


const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/create', upload.array('documente', 10), createRequest);

router.get('/history', getUserRequests);

router.get('/all', getAllRequests);
router.patch('/:id/status', updateRequestStatus);

export default router;