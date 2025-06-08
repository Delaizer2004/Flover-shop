import { Bouquet, BouquetFlower, Rating, User } from '../models/models.js';

export async function getAllBouquets(req, res) {
  try {
    const bouquets = await Bouquet.findAll();
    res.json(bouquets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getBouquetById(req, res) {
  try {
    const bouquet = await Bouquet.findByPk(req.params.id);
    if (!bouquet) return res.status(404).json({ message: 'Not found' });
    res.json(bouquet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createBouquet(req, res) {
  try {
    const { name, description, price, imageUrl, flowers } = req.body;
    const bouquet = await Bouquet.create({ name, description, price, imageUrl });
    if (Array.isArray(flowers)) {
      for (const { flowerId, quantity } of flowers) {
        await BouquetFlower.create({ bouquetId: bouquet.id, flowerId, quantity });
      }
    }
    res.status(201).json(bouquet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateBouquet(req, res) {
  try {
    const { name, description, price, imageUrl } = req.body;
    const bouquet = await Bouquet.findByPk(req.params.id);
    if (!bouquet) return res.status(404).json({ message: 'Not found' });
    await bouquet.update({ name, description, price, imageUrl });
    res.json(bouquet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteBouquet(req, res) {
  try {
    const bouquet = await Bouquet.findByPk(req.params.id);
    if (!bouquet) return res.status(404).json({ message: 'Not found' });
    await bouquet.destroy();
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getBouquetRatings(req, res) {
  try {
    const bouquetId = parseInt(req.params.id);
    if (isNaN(bouquetId)) {
        return res.status(400).json({ message: "Некоректний ID букета." });
    }
    const ratings = await Rating.findAll({
      where: {
        bouquetId: bouquetId,
        productType: 'bouquet'
      },
      include: [{ model: User, attributes: ['id', 'email'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(ratings);
  } catch (error) {
    console.error('Get Bouquet Ratings Error:', error);
    res.status(500).json({ error: 'Помилка отримання оцінок букета: ' + error.message });
  }
}