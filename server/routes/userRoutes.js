import express from 'express';
import { getCurrentUser, getSavedLeads } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', protect, getCurrentUser);
router.get('/saved', protect, getSavedLeads);

export default router;
