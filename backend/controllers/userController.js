import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/models.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function register(req, res) {
  try {
    const { email, password, role } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Already exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash, role });
    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(400).json({ message: 'Користувача з таким email не знайдено' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Невірний пароль' });
    }
    
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '1h' }
    );
    
    res.json({ 
      success: true,
      message: 'Вхід успішний',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Помилка при вході:', error);
    res.status(500).json({ 
      success: false,
      message: 'Внутрішня помилка сервера' 
    });
  }
}

export async function getUser(req, res) {
  try {
    const user = await User.findByPk(req.user.userId, { attributes: ['id','email','role'] });
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
