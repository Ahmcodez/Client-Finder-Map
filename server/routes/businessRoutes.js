import express from 'express';
import {
  createBusiness,
  getBusinessById,
  getBusinesses,
  getLeads,
  removeSavedLead,
  searchBusinesses,
  toggleSaveLead,
} from '../controllers/businessController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/leads', getLeads);
router.get('/business/search', protect, searchBusinesses);
router.get('/businesses', protect, getBusinesses);
router.get('/business/:id', protect, getBusinessById);
router.post('/business', protect, adminOnly, createBusiness);
router.post('/business/:id/save', protect, toggleSaveLead);
router.delete('/business/:id/save', protect, removeSavedLead);

export default router;
