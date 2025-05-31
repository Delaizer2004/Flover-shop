import { Flower, Rating } from '../models/models.js';
import { Op } from 'sequelize';

export async function getAllFlowers(req, res) {
  try {
    const { name, priceMin, priceMax } = req.query;
    const where = {};
    if (name)     where.name = { [Op.iLike]: `%${name}%` };
    if (priceMin) where.price = { ...(where.price||{}), [Op.gte]: +priceMin };
    if (priceMax) where.price = { ...(where.price||{}), [Op.lte]: +priceMax };
    const flowers = await Flower.findAll({ where });
    res.json(flowers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getFlowerById(req, res) {
  try {
    const flower = await Flower.findByPk(req.params.id);
    if (!flower) return res.status(404).json({ message: 'Not found' });
    res.json(flower);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createFlower(req, res) {
  try {
    const { name, description, price, stock } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const flower = await Flower.create({ name, description, price, stock, imageUrl });
    res.status(201).json(flower);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateFlower(req, res) {
  try {
    const { name, description, price, stock } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;
    const flower = await Flower.findByPk(req.params.id);
    if (!flower) return res.status(404).json({ message: 'Not found' });
    await flower.update({ name, description, price, stock, imageUrl });
    res.json(flower);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteFlower(req, res) {
  try {
    const flower = await Flower.findByPk(req.params.id);
    if (!flower) return res.status(404).json({ message: 'Not found' });
    await flower.destroy();
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getFlowerRatings(req, res) {
  try {
    const ratings = await Rating.findAll({ where: { flowerId: req.params.id } });
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
