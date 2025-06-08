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

import AdminJS from 'adminjs'
import { Database, Resource } from '@adminjs/sequelize'
import { buildAuthenticatedRouter } from '@adminjs/express'

AdminJS.registerAdapter({ Database, Resource });

const app = express();
app.use(cors({
    credentials: true, 
    origin: true 
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.ADMIN_COOKIE_SECRET || 'super-secret-for-adminjs-session', 
  resave: false,
  saveUninitialized: true,
  cookie: {
  }
}));

console.log('Sequelize models available in admin config:', Object.keys(sequelize.models));

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
        listProperties: ['id','email','role','createdAt', 'updatedAt'],
        editProperties: ['email','password','role'],
        showProperties: ['id','email','role','createdAt', 'updatedAt'],
        filterProperties: ['email', 'role', 'createdAt', 'updatedAt'],
      }
    },
    { resource: sequelize.models.flowers }, 
    { resource: sequelize.models.bouquets },
    { resource: sequelize.models.ratings },
    { resource: sequelize.models.orders },
    { resource: sequelize.models.orderItems },
    { resource: sequelize.models.cartItems }, 
  ],
  branding: {
    companyName: 'FloralBloom Admin',
    softwareBrothers: false, 
  },
});

const adminRouter = buildAuthenticatedRouter(
  adminJs,
  {
    authenticate: async (email, password) => {
      try {
        const user = await sequelize.models.users.findOne({ where: { email, role: 'ADMIN' } });
        if (user && await bcrypt.compare(password, user.password)) {
          return user.toJSON(); 
        }
      } catch (e) {
        console.error("Admin auth error:", e);
      }
      return null;
    },
    cookieName: process.env.ADMIN_COOKIE_NAME || 'adminjs',
    cookiePassword: process.env.ADMIN_COOKIE_PASSWORD || 'super-secret-cookie-password-for-admin', 
  },
  null, 
  { 
    resave: false,
    saveUninitialized: false, 
    secret: process.env.ADMIN_SESSION_SECRET || 'another-super-secret-for-admin-session',
    cookie: {
    }
  }
);

app.use(adminJs.options.rootPath, adminRouter);

const __dirname = path.resolve(path.dirname(''));
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

app.use('/api', routes);

app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});


const PORT = process.env.PORT || 5000;
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    await sequelize.sync(); 
    app.listen(PORT, () => {
      console.log(`Server is running on: http://localhost:${PORT}`);
      console.log(`AdminJS is available at: http://localhost:${PORT}${adminJs.options.rootPath}`);
    });
  } catch (err) {
    console.error('Unable to connect to the database or start server:', err);
  }
})();