import sequelize from '../db.js'
import { DataTypes } from 'sequelize'

// таблиця "users"
export const User = sequelize.define('users', {
  id: { type: DataTypes.INTEGER,   primaryKey: true, autoIncrement: true },
  email:    { type: DataTypes.STRING,  unique: true, allowNull: false },
  password: { type: DataTypes.STRING,  allowNull: false },
  role:     { type: DataTypes.STRING,  defaultValue: 'USER' },
}, {
  tableName: 'users',
  freezeTableName: true,
  timestamps: true,
})

// таблиця "flowers"
export const Flower = sequelize.define('flowers', {
  id: { type: DataTypes.INTEGER,   primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING,  allowNull: false },
  description: DataTypes.TEXT,
  price:       { type: DataTypes.DECIMAL(10,2), allowNull: false },
  stock:       { type: DataTypes.INTEGER, allowNull: false },
  imageUrl:    DataTypes.STRING,
}, {
  tableName: 'flowers',
  freezeTableName: true,
  timestamps: true,
})

// таблиця "bouquets"
export const Bouquet = sequelize.define('bouquets', {
  id: { type: DataTypes.INTEGER,   primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING,  allowNull: false },
  description: DataTypes.TEXT,
  price:       { type: DataTypes.DECIMAL(10,2), allowNull: false },
  imageUrl:    DataTypes.STRING,
}, {
  tableName: 'bouquets',
  freezeTableName: true,
  timestamps: true,
})

// таблиця "bouquetFlowers" 
export const BouquetFlower = sequelize.define('bouquetFlowers', {
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
}, {
  tableName: 'bouquetFlowers',
  freezeTableName: true,
  timestamps: false, 
})

// таблиця "ratings"
export const Rating = sequelize.define('ratings', {
  id:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  rating: { type: DataTypes.SMALLINT, allowNull: false, validate: { min: 1, max: 5 } },
  review: DataTypes.TEXT,
  productType: { type: DataTypes.STRING, allowNull: false }, 
}, {
  tableName: 'ratings',
  freezeTableName: true,
  timestamps: true,
  hooks: {
    beforeValidate: (rating, options) => {
      if (!rating.productType) {
        throw new Error('productType є обов\'язковим.');
      }
      if (rating.productType === 'flower' && !rating.flowerId) {
        throw new Error('flowerId є обов\'язковим, якщо productType це "flower".');
      }
      if (rating.productType === 'bouquet' && !rating.bouquetId) {
        throw new Error('bouquetId є обов\'язковим, якщо productType це "bouquet".');
      }
      if (rating.productType !== 'flower' && rating.productType !== 'bouquet') {
        throw new Error('productType має бути "flower" або "bouquet".');
      }
      if (rating.flowerId && rating.bouquetId) {
          throw new Error('Може бути встановлено або flowerId, або bouquetId, але не обидва.');
      }
      if (!rating.flowerId && !rating.bouquetId) {
          throw new Error('Має бути встановлено або flowerId, або bouquetId.');
      }
    }
  }
});

// таблиця "orders"
export const Order = sequelize.define('orders', {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  totalPrice: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  status:     { type: DataTypes.STRING, defaultValue: 'pending' },
}, {
  tableName: 'orders',
  freezeTableName: true,
  timestamps: true,
})

// таблиця "orderItems"
export const OrderItem = sequelize.define('orderItems', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  price:    { type: DataTypes.DECIMAL(10,2), allowNull: false },
}, {
  tableName: 'orderItems',
  freezeTableName: true,
  timestamps: false,
})

// таблиця "CartItems"
export const CartItem = sequelize.define('cartItems', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:      { type: DataTypes.INTEGER, allowNull: false },
  name:        { type: DataTypes.STRING,  allowNull: false },
  description: { type: DataTypes.TEXT },
  price:       { type: DataTypes.FLOAT,   allowNull: false },
  imageUrl:    DataTypes.STRING,
  quantity:    { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  productId:   { type: DataTypes.INTEGER, allowNull: false },
  productType: { type: DataTypes.STRING,  allowNull: false },
}, {
  tableName: 'CartItems',
  freezeTableName: true,
  timestamps: true,
})


// Встановлення зв’язків

// User ↔ Rating
User.hasMany(Rating, { foreignKey: 'userId', onDelete: 'CASCADE' });
Rating.belongsTo(User, { foreignKey: 'userId', allowNull: false });

// User ↔ Order
User.hasMany(Order, { onDelete: 'SET NULL' }); 
Order.belongsTo(User);

// User ↔ CartItem
User.hasMany(CartItem, { foreignKey: 'userId', onDelete: 'CASCADE' });
CartItem.belongsTo(User, { foreignKey: 'userId' });

// Flower ↔ Rating
Flower.hasMany(Rating, {
  foreignKey: 'flowerId',
  scope: { productType: 'flower' },
  constraints: false,
  onDelete: 'CASCADE'
});
Rating.belongsTo(Flower, { foreignKey: 'flowerId', as: 'flowerRating', constraints: false });

// Bouquet ↔ Rating
Bouquet.hasMany(Rating, {
  foreignKey: 'bouquetId',
  scope: { productType: 'bouquet' },
  constraints: false,
  onDelete: 'CASCADE'
});
Rating.belongsTo(Bouquet, { foreignKey: 'bouquetId', as: 'bouquetRating', constraints: false });


// Bouquet ↔ Flower 
Bouquet.belongsToMany(Flower,    { through: BouquetFlower, onDelete: 'CASCADE' });
Flower.belongsToMany(Bouquet,    { through: BouquetFlower, onDelete: 'CASCADE' });


// Order ↔ OrderItem
Order.hasMany(OrderItem, { onDelete: 'CASCADE' });
OrderItem.belongsTo(Order);

// Flower ↔ OrderItem
Flower.hasMany(OrderItem, { foreignKey: 'flowerId', onDelete: 'SET NULL' });
OrderItem.belongsTo(Flower, { foreignKey: 'flowerId' });

// Bouquet ↔ OrderItem
Bouquet.hasMany(OrderItem, { foreignKey: 'bouquetId', onDelete: 'SET NULL' });
OrderItem.belongsTo(Bouquet, { foreignKey: 'bouquetId' });