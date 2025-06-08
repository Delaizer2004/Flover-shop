import { Order, OrderItem, CartItem, Flower, Bouquet, } from '../models/models.js'; 

import sequelize from '../db.js';

export async function createOrder(req, res) {
  const transaction = await sequelize.transaction(); 
  try {
    const userId = req.user.userId;

    const cartItems = await CartItem.findAll({
      where: { userId },
      transaction
    });

    if (!cartItems || cartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Ваш кошик порожній. Неможливо створити замовлення.' });
    }

    let totalPrice = 0;
    const orderItemsData = [];

    for (const cartItem of cartItems) {
      let product;
      if (cartItem.productType === 'flower') {
        product = await Flower.findByPk(cartItem.productId, { transaction });
        if (product && product.stock < cartItem.quantity) {
          await transaction.rollback();
          return res.status(400).json({ message: `Недостатньо товару "${cartItem.name}" на складі. Доступно: ${product.stock}, у кошику: ${cartItem.quantity}.` });
        }
      } else { 
        product = await Bouquet.findByPk(cartItem.productId, { transaction });
      }

      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ message: `Товар "${cartItem.name}" (${cartItem.productType}) більше не доступний.` });
      }

      totalPrice += cartItem.price * cartItem.quantity;
      orderItemsData.push({
        flowerId: cartItem.productType === 'flower' ? cartItem.productId : null,
        bouquetId: cartItem.productType === 'bouquet' ? cartItem.productId : null,
        quantity: cartItem.quantity,
        price: cartItem.price, 
      });
    }

    const order = await Order.create({
      userId,
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      status: 'pending'
    }, { transaction });

    for (const itemData of orderItemsData) {
      await OrderItem.create({
        orderId: order.id,
        ...itemData
      }, { transaction });

      if (itemData.flowerId) {
        await Flower.update(
          { stock: sequelize.literal(`stock - ${itemData.quantity}`) },
          { where: { id: itemData.flowerId }, transaction }
        );
      }
    }

    await CartItem.destroy({ where: { userId }, transaction });

    await transaction.commit(); 
    res.status(201).json(order);

  } catch (error) {
    await transaction.rollback();
    console.error('Create Order Error:', error);
    res.status(500).json({ error: 'Помилка створення замовлення: ' + error.message });
  }
}


export async function getOrdersByUser(req, res) {
  try {
    const userId = req.user.userId; 
    const orders = await Order.findAll({
      where: { userId: userId },
      include: [{
        model: OrderItem,
      }],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (error) {
    console.error('Get Orders By User error:', error);
    res.status(500).json({ error: 'Помилка отримання замовлень: ' + error.message });
  }
}

export async function getOrderById(req, res) { 
  try {
    const orderId = req.params.orderId;
    const userId = req.user.userId; 
    
    const order = await Order.findOne({ 
        where: { id: orderId, userId: userId }, 
        include: [{
            model: OrderItem,
            include: [ 
                { model: Flower, required: false, attributes: ['name', 'imageUrl'] },
                { model: Bouquet, required: false, attributes: ['name', 'imageUrl'] }
            ]
        }]
    });
    if (!order) return res.status(404).json({ message: 'Замовлення не знайдено або воно не належить вам.' });
    res.json(order);
  } catch (error) {
    console.error('Get Order By Id error:', error);
    res.status(500).json({ error: 'Помилка отримання замовлення: ' + error.message });
  }
}


export async function updateOrderStatus(req, res) { 
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Замовлення не знайдено.' });
    
    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Неприпустимий статус замовлення.' });
    }

    await order.update({ status });
    res.json(order);
  } catch (error) {
    console.error('Update Order Status error:', error);
    res.status(500).json({ error: 'Помилка оновлення статусу замовлення: ' + error.message });
  }
}

export async function deleteOrder(req, res) { 
  try {
    const deleted = await Order.destroy({ where: { id: req.params.orderId } });
    if (!deleted) return res.status(404).json({ message: 'Замовлення не знайдено.' });
    res.json({ message: 'Замовлення видалено.' });
  } catch (error) {
    console.error('Delete Order error:', error);
    res.status(500).json({ error: 'Помилка видалення замовлення: ' + error.message });
  }
}