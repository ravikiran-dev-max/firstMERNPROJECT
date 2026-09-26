import express from 'express';
import {
  verifyAdminMiddleware,
  checkAdminAuth,
  getAdminEntries,
  deleteEntry,
  clearAllEntries,
  exportEntriesCsv
} from '../controllers/adminController.js';

const router = express.Router();

// Apply admin verification middleware to all admin endpoints
router.use(verifyAdminMiddleware);

// Admin status & credential verification
router.post('/auth', checkAdminAuth);

// Get all entries with search, filter, pagination, stats
router.get('/entries', getAdminEntries);

// Delete single entry
router.delete('/entries/:id', deleteEntry);

// Reset / Clear all entries
router.post('/clear-all', clearAllEntries);

// Export CSV
router.get('/export-csv', exportEntriesCsv);

export default router;
