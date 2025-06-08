import express from 'express';
import userRouter from './userRouter.js';
import flowerRouter from './flowerRouter.js';
import bouquetRouter from './bouquetRouter.js';
import ratingRouter from './ratingRouter.js';
import orderRouter from './orderRouter.js';
import cartRouter from './cartRouter.js'; 

const router = express.Router();

router.use('/users', userRouter);
router.use('/flowers', flowerRouter);
router.use('/bouquets', bouquetRouter);
router.use('/ratings', ratingRouter);
// router.use('/basket', basketRouter); 
router.use('/orders', orderRouter);
router.use('/cart', cartRouter); 

export default router;
