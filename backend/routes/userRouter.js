import express from 'express';
import * as userCtrl from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', userCtrl.register);
router.post('/login',    userCtrl.login);
router.get('/me',        authenticateToken, userCtrl.getUser);

export default router;
