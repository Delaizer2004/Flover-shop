import express from 'express';
import * as cartCtrl from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/',            authenticateToken, cartCtrl.getCart);
router.post('/add',        authenticateToken, cartCtrl.addToCart);
router.delete('/remove/:id', authenticateToken, cartCtrl.removeFromCart);

export default router;
