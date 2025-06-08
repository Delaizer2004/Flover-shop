// backend/routes/ratingRouter.js
import express from 'express';
import * as ratingCtrl from '../controllers/ratingController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/authMiddleware.js'; 

const router = express.Router();

router.post('/', authenticateToken, ratingCtrl.createRating);
router.get('/', ratingCtrl.getAllRatings);
router.get('/:id', ratingCtrl.getRatingById);
router.put('/:id', authenticateToken, ratingCtrl.updateRating);
router.delete('/:id', authenticateToken, ratingCtrl.deleteRating);

export default router;