import express from 'express';
import * as orderCtrl from '../controllers/orderController.js';
const router = express.Router();

router.post('/',        orderCtrl.createOrder);
router.get('/:userId',  orderCtrl.getOrdersByUser);
router.get('/single/:orderId', orderCtrl.getOrderById);
router.put('/:orderId/status', orderCtrl.updateOrderStatus);
router.delete('/:orderId',     orderCtrl.deleteOrder);

export default router;
