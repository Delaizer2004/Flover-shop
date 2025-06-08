import express from 'express';
import * as basketCtrl from '../controllers/basketController.js';
const router = express.Router();

router.get('/:userId',         basketCtrl.getBasket);
router.post('/:userId/flowers', basketCtrl.addFlowerToBasket);
router.put('/:userId/flowers/:flowerId', basketCtrl.updateBasketFlower);
router.delete('/:userId/flowers/:flowerId', basketCtrl.removeFlowerFromBasket);

export default router;
