import { Rating, User, Flower, Bouquet } from '../models/models.js';

export async function createRating(req, res) {
  try {
    const userId = req.user.userId;
    const { productId, productType, rating, review } = req.body;

    if (!productId || !productType || rating === undefined) { 
      return res.status(400).json({ message: 'productId, productType та rating є обов\'язковими.' });
    }
    const parsedRating = parseInt(rating, 10);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({ message: 'Рейтинг має бути числом від 1 до 5.' });
    }

    // Перевірка, чи існує товар
    let productExists;
    if (productType === 'flower') {
        productExists = await Flower.findByPk(parseInt(productId));
    } else if (productType === 'bouquet') {
        productExists = await Bouquet.findByPk(parseInt(productId));
    } else {
        return res.status(400).json({ message: 'Неправильний productType. Має бути "flower" або "bouquet".' });
    }

    if (!productExists) {
        return res.status(404).json({ message: `Товар (ID: ${productId}, Тип: ${productType}) не знайдено.` });
    }

    const whereClauseForExisting = {
      userId,
      productType,
    };
    if (productType === 'flower') {
      whereClauseForExisting.flowerId = parseInt(productId);
    } else {
      whereClauseForExisting.bouquetId = parseInt(productId);
    }

    const existingRating = await Rating.findOne({ where: whereClauseForExisting });

    if (existingRating) {
      existingRating.rating = parsedRating;
      existingRating.review = review || existingRating.review; 
      await existingRating.save();
      return res.status(200).json({ message: 'Вашу оцінку оновлено.', rating: existingRating });
    }


    const newRatingData = {
      userId,
      productType,
      rating: parsedRating,
      review: review || null,
    };

    if (productType === 'flower') {
      newRatingData.flowerId = parseInt(productId);
    } else {
      newRatingData.bouquetId = parseInt(productId);
    }

    const r = await Rating.create(newRatingData);
    res.status(201).json(r);
  } catch (error) {
    console.error('Create Rating Error:', error);
    if (error.name === 'SequelizeValidationError' || error.message.includes('є обов\'язковим') || error.message.includes('Може бути встановлено або')) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ error: 'Помилка створення оцінки: ' + error.message });
  }
}

export async function getAllRatings(req, res) {
  try {
    const { productType, productId } = req.query;
    const whereClause = {};

    if (productType) {
        if (productType !== 'flower' && productType !== 'bouquet') {
            return res.status(400).json({ message: 'Неправильний productType для фільтрації.' });
        }
        whereClause.productType = productType;
        if (productId) {
            const parsedProductId = parseInt(productId);
            if (isNaN(parsedProductId)) {
                return res.status(400).json({ message: 'productId має бути числом.' });
            }
            if (productType === 'flower') whereClause.flowerId = parsedProductId;
            else if (productType === 'bouquet') whereClause.bouquetId = parsedProductId;
        }
    }

    const list = await Rating.findAll({
        where: whereClause,
        include: [
            { model: User, attributes: ['id', 'email'] },
            { model: Flower, as: 'flowerRating', required: false, attributes: ['id', 'name'] },
            { model: Bouquet, as: 'bouquetRating', required: false, attributes: ['id', 'name'] }
        ],
        order: [['createdAt', 'DESC']]
    });
    res.json(list);
  } catch (error) {
    console.error('Get All Ratings Error:', error);
    res.status(500).json({ error: 'Помилка отримання оцінок: ' + error.message });
  }
}

export async function getRatingById(req, res) {
  try {
    const r = await Rating.findByPk(req.params.id, {
        include: [
            { model: User, attributes: ['id', 'email'] },
            { model: Flower, as: 'flowerRating', required: false, attributes: ['id', 'name'] },
            { model: Bouquet, as: 'bouquetRating', required: false, attributes: ['id', 'name'] }
        ]
    });
    if (!r) return res.status(404).json({ message: 'Оцінку не знайдено.' });
    res.json(r);
  } catch (error) {
    console.error('Get Rating By ID Error:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function updateRating(req, res) {
  try {
    const userId = req.user.userId;
    const ratingId = req.params.id;
    const { rating, review } = req.body;

    const r = await Rating.findOne({ where: { id: ratingId, userId: userId } });
    if (!r) return res.status(404).json({ message: 'Оцінку не знайдено або вона не належить вам.' });

    if (rating === undefined && review === undefined) {
        return res.status(400).json({ message: "Потрібно надати нову оцінку або відгук."})
    }
    const updateData = {};
    if (rating !== undefined) {
        const parsedRating = parseInt(rating, 10);
        if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
            return res.status(400).json({ message: 'Рейтинг має бути числом від 1 до 5.' });
        }
        updateData.rating = parsedRating;
    }
    if (review !== undefined) updateData.review = review; 

    await r.update(updateData);
    const updatedRating = await Rating.findByPk(r.id, { 
        include: [
            { model: User, attributes: ['id', 'email'] },
            { model: Flower, as: 'flowerRating', required: false, attributes: ['id', 'name'] },
            { model: Bouquet, as: 'bouquetRating', required: false, attributes: ['id', 'name'] }
        ]
    });
    res.json(updatedRating);
  } catch (error) {
    console.error('Update Rating Error:', error);
     if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

export async function deleteRating(req, res) {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const ratingId = req.params.id;

    const whereClause = { id: ratingId };
    if (userRole !== 'ADMIN') {
        whereClause.userId = userId;
    }

    const r = await Rating.findOne({ where: whereClause });
    if (!r) return res.status(404).json({ message: 'Оцінку не знайдено або у вас немає прав на її видалення.' });
    
    await r.destroy();
    res.json({ message: 'Оцінку видалено.' });
  } catch (error) {
    console.error('Delete Rating Error:', error);
    res.status(500).json({ error: error.message });
  }
}
