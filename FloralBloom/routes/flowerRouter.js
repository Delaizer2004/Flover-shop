import express from 'express';
import * as flowerCtrl from '../controllers/flowerController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/',             flowerCtrl.getAllFlowers);
router.get('/:id',          flowerCtrl.getFlowerById);
router.post('/',   upload.single('image'), flowerCtrl.createFlower);
router.put('/:id',  upload.single('image'), flowerCtrl.updateFlower);
router.delete('/:id',       flowerCtrl.deleteFlower);
router.get('/:id/ratings',  flowerCtrl.getFlowerRatings);

export default router;
