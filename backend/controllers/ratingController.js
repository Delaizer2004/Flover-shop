import { Rating } from '../models/models.js';

export async function createRating(req, res) {
  try {
    const { userId, flowerId, rating, review } = req.body;
    const r = await Rating.create({ userId, flowerId, rating, review });
    res.status(201).json(r);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAllRatings(req, res) {
  try {
    const list = await Rating.findAll();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getRatingById(req, res) {
  try {
    const r = await Rating.findByPk(req.params.id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    res.json(r);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateRating(req, res) {
  try {
    const { rating, review } = req.body;
    const r = await Rating.findByPk(req.params.id);
    if (!r) return res.status(404).json({ message: 'Not found' });
    await r.update({ rating, review });
    res.json(r);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteRating(req, res) {
  try {
    const deleted = await Rating.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
