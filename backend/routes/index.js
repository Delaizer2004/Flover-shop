import express from 'express';
import userRouter from './userRouter.js';
import flowerRouter from './flowerRouter.js';
import bouquetRouter from './bouquetRouter.js';
import ratingRouter from './ratingRouter.js';
import basketRouter from './basketRouter.js';
import orderRouter from './orderRouter.js';

const router = express.Router();

router.use('/users', userRouter);
router.use('/flowers', flowerRouter);
router.use('/bouquets', bouquetRouter);
router.use('/ratings', ratingRouter);
router.use('/basket', basketRouter);
router.use('/orders', orderRouter);

export default router;
