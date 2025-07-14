import express from 'express';
import {
  handleGetAllRegister,
  handleGetRegisterByBarcodeId,
  handleRegister,
  handleUpdateRegister,
} from '../controllers/register.controller';
import { verifyAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/register', handleRegister);
router.patch('/register', verifyAdmin, handleUpdateRegister);
router.get('/register', verifyAdmin, handleGetAllRegister);
router.get('/register/:id', verifyAdmin, handleGetRegisterByBarcodeId);

export default router;
