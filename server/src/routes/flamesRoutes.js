import express from 'express';
import { playFlames, getPublicStats } from '../controllers/flamesController.js';

const router = express.Router();

// Calculate FLAMES result and store entry
router.post('/play', playFlames);

// Public aggregate stats
router.get('/stats', getPublicStats);

export default router;
