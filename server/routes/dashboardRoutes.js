import express from 'express';
import {
  getDashboardStats,
  getRecentDocuments,
  getDashboardExpiryAndSummary,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/recent-documents', getRecentDocuments);
router.get('/expiry', getDashboardExpiryAndSummary);

export default router;
