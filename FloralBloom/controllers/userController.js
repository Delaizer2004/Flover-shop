import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/models.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function register(req, res) {
  try {
    const { email, password, role } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'User with this email already exists.' }); 

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash, role: role || 'USER' }); 

    res.status(201).json({
      message: 'User registered successfully.', 
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error); 
    res.status(500).json({ error: 'An error occurred during registration.', details: error.message }); 
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' }); 

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password.' }); 

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' } 
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'Strict', 
      maxAge: 60 * 60 * 1000 
    });

    res.json({
      message: 'Logged in successfully',
      token: token, 
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error); 
    res.status(500).json({ error: 'An error occurred during login.', details: error.message });
  }
}

export async function getUser(req, res) {
  try {
    const userFromDb = await User.findByPk(req.user.userId, {
      attributes: ['id', 'email', 'role'] 
    });

    if (!userFromDb) {
      return res.status(404).json({ message: 'User not found in database.' });
    }
    res.json(userFromDb);
  } catch (error)
 {
    console.error('Get user error:', error); 
    res.status(500).json({ error: 'An error occurred while fetching user data.', details: error.message });
  }
}
