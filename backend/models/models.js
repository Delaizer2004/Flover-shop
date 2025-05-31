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
  rating: { type: DataTypes.SMALLINT, allowNull: false },
  review: DataTypes.TEXT,
}, {
  tableName: 'ratings',
  freezeTableName: true,
  timestamps: true,
})

// таблиця "baskets"
export const Basket = sequelize.define('baskets', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
}, {
  tableName: 'baskets',
  freezeTableName: true,
  timestamps: true,
})

// таблиця "basketFlowers"
export const BasketFlower = sequelize.define('basketFlowers', {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
}, {
  tableName: 'basketFlowers',
  freezeTableName: true,
  timestamps: false,
})

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
  description: { type: DataTypes.TEXT,    allowNull: false },
  price:       { type: DataTypes.FLOAT,   allowNull: false },
  imageUrl:    DataTypes.STRING,
  quantity:    { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
}, {
  tableName: 'CartItems',
  freezeTableName: true,
  timestamps: true,
})

// Встановлення зв’язків

// User ↔ Basket
User.hasOne(Basket)
Basket.belongsTo(User)

// User ↔ Rating
User.hasMany(Rating)
Rating.belongsTo(User)

// User ↔ Order
User.hasMany(Order)
Order.belongsTo(User)

// User ↔ CartItem
User.hasMany(CartItem)
CartItem.belongsTo(User)

// Flower ↔ Rating
Flower.hasMany(Rating)
Rating.belongsTo(Flower)

// Bouquet ↔ Flower (через BouquetFlower)
Bouquet.belongsToMany(Flower,    { through: BouquetFlower })
Flower.belongsToMany(Bouquet,    { through: BouquetFlower })

// Basket ↔ BasketFlower
Basket.hasMany(BasketFlower)
BasketFlower.belongsTo(Basket)

// Flower ↔ BasketFlower
Flower.hasMany(BasketFlower)
BasketFlower.belongsTo(Flower)

// Order ↔ OrderItem
Order.hasMany(OrderItem)
OrderItem.belongsTo(Order)

// Flower ↔ OrderItem
Flower.hasMany(OrderItem)
OrderItem.belongsTo(Flower)

// Bouquet ↔ OrderItem
Bouquet.hasMany(OrderItem)
OrderItem.belongsTo(Bouquet)
