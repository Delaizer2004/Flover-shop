import { Order, OrderItem } from '../models/models.js';

export async function createOrder(req, res) {
  try {
    const { userId, totalPrice, items } = req.body;
    const order = await Order.create({ userId, totalPrice, status: 'pending' });
    for (const it of items) {
      await OrderItem.create({
        orderId: order.id,
        flowerId: it.flowerId || null,
        bouquetId: it.bouquetId || null,
        quantity: it.quantity,
        price: it.price,
      });
    }
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getOrdersByUser(req, res) {
  try {
    const orders = await Order.findAll({
      where: { userId: req.params.userId },
      include: [OrderItem],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getOrderById(req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId, { include: [OrderItem] });
    if (!order) return res.status(404).json({ message: 'Not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Not found' });
    await order.update({ status });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteOrder(req, res) {
  try {
    const deleted = await Order.destroy({ where: { id: req.params.orderId } });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
