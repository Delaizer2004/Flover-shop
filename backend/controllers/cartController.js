import { CartItem, Flower } from '../models/models.js';

export async function getCart(req, res) {
  try {
    const items = await CartItem.findAll({ where: { userId: req.user.userId } });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function addToCart(req, res) {
  try {
    const { flowerId, quantity } = req.body;
    const flower = await Flower.findByPk(flowerId);
    if (!flower) return res.status(404).json({ message: 'Flower not found' });
    const item = await CartItem.create({
      userId: req.user.userId,
      name: flower.name,
      description: flower.description,
      price: flower.price,
      imageUrl: flower.imageUrl,
      quantity,
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function removeFromCart(req, res) {
  try {
    const { id } = req.params;
    const item = await CartItem.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    await item.destroy();
    res.json({ message: 'Removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
