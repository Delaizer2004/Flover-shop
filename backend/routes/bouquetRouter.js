import express from 'express';
import * as bouquetCtrl from '../controllers/bouquetController.js';
const router = express.Router();

router.get('/',       bouquetCtrl.getAllBouquets);
router.get('/:id',    bouquetCtrl.getBouquetById);
router.post('/',      bouquetCtrl.createBouquet);
router.put('/:id',    bouquetCtrl.updateBouquet);
router.delete('/:id', bouquetCtrl.deleteBouquet);

export default router;
