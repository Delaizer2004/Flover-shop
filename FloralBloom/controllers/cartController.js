import { CartItem, Flower, Bouquet } from '../models/models.js';

export async function getCart(req, res) {
  console.log('[getCart] Attempting to get cart for userId:', req.user ? req.user.userId : 'User not found on req');
  try {
    const items = await CartItem.findAll({ 
        where: { userId: req.user.userId }, 
        order: [['createdAt', 'DESC']] 
    });
    console.log('[getCart] Items found:', items ? items.length : 'null');
    res.json(items);
  } catch (error) {
    console.error('Get Cart error detailed:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Помилка отримання кошика: ' + error.message });
  }
}


export async function addToCart(req, res) {
  try {
    const { productId, productType, quantity } = req.body;
    const userId = req.user.userId;

    if (!productId || !productType || quantity === undefined) {
      return res.status(400).json({ message: 'productId, productType та quantity є обов\'язковими.' });
    }
    if (productType !== 'flower' && productType !== 'bouquet') {
      return res.status(400).json({ message: 'Неправильний productType. Має бути "flower" або "bouquet".' });
    }
    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity <= 0) {
        return res.status(400).json({ message: 'Кількість має бути позитивним числом.' });
    }

    let product;
    if (productType === 'flower') {
      product = await Flower.findByPk(productId);
    } else { 
      product = await Bouquet.findByPk(productId);
    }

    if (!product) {
      return res.status(404).json({ message: `${productType === 'flower' ? 'Квітку' : 'Букет'} не знайдено.` });
    }

    let cartItem = await CartItem.findOne({
      where: {
        userId: userId,
        productId: productId,
        productType: productType
      }
    });

    if (cartItem) {
      cartItem.quantity += numQuantity;
      if (productType === 'flower' && cartItem.quantity > product.stock) { 
        return res.status(400).json({ message: `Недостатньо товару "${product.name}" на складі. Доступно: ${product.stock}`});
      }
      await cartItem.save();
      res.status(200).json({ message: 'Кількість товару в кошику оновлено.', item: cartItem });
    } else {
      if (productType === 'flower' && numQuantity > product.stock) { 
        return res.status(400).json({ message: `Недостатньо товару "${product.name}" на складі. Доступно: ${product.stock}`});
      }
      cartItem = await CartItem.create({
        userId: userId,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity: numQuantity,
        productId: productId,
        productType: productType,
      });
      res.status(201).json({ message: 'Товар додано до кошика.', item: cartItem });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Помилка додавання до кошика: ' + error.message });
  }
}

export async function removeFromCart(req, res) {
  try {
    const { id } = req.params; 
    const item = await CartItem.findOne({ where: { id: id, userId: req.user.userId } });
    if (!item) return res.status(404).json({ message: 'Товар в кошику не знайдено або він не належить вам.' });
    await item.destroy();
    res.json({ message: 'Товар видалено з кошика.' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Помилка видалення з кошика: ' + error.message });
  }
}
