import { Basket, BasketFlower, Flower } from '../models/models.js';

export async function getBasket(req, res) {
  try {
    const basket = await Basket.findOne({
      where: { userId: req.params.userId },
      include: {
        model: BasketFlower,
        include: [Flower],
      },
    });
    if (!basket) return res.status(404).json({ message: 'Basket not found' });
    res.json(basket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function addFlowerToBasket(req, res) {
  try {
    const { flowerId, quantity } = req.body;
    let basket = await Basket.findOne({ where: { userId: req.params.userId } });
    if (!basket) {
      basket = await Basket.create({ userId: req.params.userId });
    }
    const item = await BasketFlower.create({
      basketId: basket.id,
      flowerId, quantity,
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateBasketFlower(req, res) {
  try {
    const { quantity } = req.body;
    const basket = await Basket.findOne({ where: { userId: req.params.userId } });
    if (!basket) return res.status(404).json({ message: 'Basket not found' });
    const item = await BasketFlower.findOne({
      where: { basketId: basket.id, flowerId: req.params.flowerId },
    });
    if (!item) return res.status(404).json({ message: 'Item not in basket' });
    await item.update({ quantity });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function removeFlowerFromBasket(req, res) {
  try {
    const basket = await Basket.findOne({ where: { userId: req.params.userId } });
    if (!basket) return res.status(404).json({ message: 'Basket not found' });
    const deleted = await BasketFlower.destroy({
      where: { basketId: basket.id, flowerId: req.params.flowerId },
    });
    if (!deleted) return res.status(404).json({ message: 'Item not in basket' });
    res.json({ message: 'Removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
