import 'dotenv/config'
import express from 'express'
import path from 'path'
import cors from 'cors'
import bcrypt from 'bcrypt'
import cookieParser from 'cookie-parser'
import session from 'express-session'

import sequelize from './db.js'
import routes from './routes/index.js'
import './models/models.js'  

import flowerRouter from './routes/flowerRouter.js'
import cartRouter from './routes/cartRouter.js'
import userRouter from './routes/userRouter.js'

import AdminJS from 'adminjs'
import { Database, Resource } from '@adminjs/sequelize'
import { buildAuthenticatedRouter } from '@adminjs/express'
import { authenticateToken } from './middleware/authMiddleware.js'

AdminJS.registerAdapter({ Database, Resource })

const app = express()
app.use(cors({
  origin: 'http://localhost', // або адреса вашого фронтенду
  credentials: true}))
app.use(express.json())
app.use(cookieParser())
app.use(session({
  secret: process.env.ADMIN_COOKIE_SECRET || 'really-long-secret',
  resave: false,
  saveUninitialized: true,
}))

console.log('Sequelize models:', Object.keys(sequelize.models))

const adminJs = new AdminJS({
  databases: [sequelize],
  rootPath: '/admin',
  resources: [
    {
      resource: sequelize.models.users,
      options: {
        properties: {
          password: {
            isVisible: { list: false, show: false, edit: true, filter: false }
          }
        },
        listProperties: ['id','email','role','createdAt'],
        editProperties: ['email','password','role'],
      }
    },
    { resource: sequelize.models.flowers },
    { resource: sequelize.models.bouquets },
    { resource: sequelize.models.bouquetFlowers },
    { resource: sequelize.models.ratings },
    { resource: sequelize.models.baskets },
    { resource: sequelize.models.basketFlowers },
    { resource: sequelize.models.orders },
    { resource: sequelize.models.orderItems },
    { resource: sequelize.models.cartItems },
  ],
  branding: { companyName: 'FloralBloom', softwareBrothers: false },
})

const adminRouter = buildAuthenticatedRouter(
  adminJs,
  {
    authenticate: async (email, password) => {
      const user = await sequelize.models.users.findOne({ where: { email, role: 'ADMIN' } })
      if (user && await bcrypt.compare(password, user.password)) {
        return user
      }
      return null
    },
    cookieName: 'adminjs',
    cookiePassword: process.env.ADMIN_COOKIE_SECRET || 'really-long-secret',
  },
  null,
  { resave: false, saveUninitialized: true }
)

app.use(adminJs.options.rootPath, adminRouter)
app.use(express.static(path.resolve('frontend')))
app.use('/api', routes);
app.use('/api/flowers', flowerRouter);
app.use('/api/cart', cartRouter);
app.use('/api/users', userRouter);

const PORT = process.env.PORT || 5000
;(async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync()
    app.listen(PORT, () => {
      console.log(`Server: http://localhost:${PORT}`)
      console.log(`Admin:  http://localhost:${PORT}${adminJs.options.rootPath}`)
    })
  } catch (err) {
    console.error('Failed to start:', err)
  }
})()
