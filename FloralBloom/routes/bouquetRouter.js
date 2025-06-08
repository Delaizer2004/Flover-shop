import express from 'express';
import * as bouquetCtrl from '../controllers/bouquetController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/authMiddleware.js'; 

const router = express.Router();

router.get('/',       bouquetCtrl.getAllBouquets);
router.get('/:id',    bouquetCtrl.getBouquetById);
router.post('/',      authenticateToken, authorizeAdmin, bouquetCtrl.createBouquet);
router.put('/:id',    authenticateToken, authorizeAdmin, bouquetCtrl.updateBouquet);
router.delete('/:id', authenticateToken, authorizeAdmin, bouquetCtrl.deleteBouquet);

router.get('/:id/ratings', bouquetCtrl.getBouquetRatings); 

export default router;
