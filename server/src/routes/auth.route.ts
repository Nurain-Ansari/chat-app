import express from 'express';
import { checkAdminAccess } from '../controllers/auth.controller';

const router = express.Router();

router.post('/auth', checkAdminAccess);

export default router;
