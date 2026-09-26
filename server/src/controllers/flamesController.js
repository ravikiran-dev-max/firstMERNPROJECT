import FlameEntry from '../models/FlameEntry.js';
import { calculateFlames, validateNames } from '../utils/flamesCalculator.js';
import { dbStatus, localStore } from '../config/db.js';

/**
 * Handle FLAMES game calculation and record storage
 * POST /api/flames/play
 */
export const playFlames = async (req, res) => {
  try {
    const { name1, name2 } = req.body;

    // Validate inputs
    const validation = validateNames(name1, name2);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Perform FLAMES calculation
    const calcResult = calculateFlames(name1, name2);

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const entryData = {
      name1: calcResult.name1,
      name2: calcResult.name2,
      resultKey: calcResult.resultKey,
      resultName: calcResult.resultName,
      icon: calcResult.result.icon,
      remainingCount: calcResult.remainingCount,
      matchedLetters: calcResult.matchedLetters,
      remainingLetters1: calcResult.remaining1,
      remainingLetters2: calcResult.remaining2,
      isPerfectMatch: calcResult.isPerfectMatch,
      clientInfo: {
        ip: String(clientIp),
        userAgent: String(userAgent).substring(0, 150)
      }
    };

    let savedId = null;

    // Persist to MongoDB or local fallback
    if (dbStatus.isConnected) {
      try {
        const doc = await FlameEntry.create(entryData);
        savedId = doc._id;
      } catch (dbErr) {
        console.error('[DB Write Error, falling back to local store]:', dbErr.message);
        const fallbackDoc = localStore.save(entryData);
        savedId = fallbackDoc._id;
      }
    } else {
      const fallbackDoc = localStore.save(entryData);
      savedId = fallbackDoc._id;
    }

    return res.status(200).json({
      success: true,
      data: {
        id: savedId,
        name1: calcResult.name1,
        name2: calcResult.name2,
        cleanedName1: calcResult.cleanedName1,
        cleanedName2: calcResult.cleanedName2,
        matchedLetters: calcResult.matchedLetters,
        remainingLetters1: calcResult.remaining1,
        remainingLetters2: calcResult.remaining2,
        remainingCount: calcResult.remainingCount,
        isPerfectMatch: calcResult.isPerfectMatch,
        eliminationSteps: calcResult.eliminationSteps,
        resultKey: calcResult.resultKey,
        resultName: calcResult.resultName,
        result: calcResult.result,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[playFlames Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred during FLAMES calculation.'
    });
  }
};

/**
 * Public high-level stats (Total played, without disclosing names/entries)
 * GET /api/flames/stats
 */
export const getPublicStats = async (req, res) => {
  try {
    let totalGames = 0;

    if (dbStatus.isConnected) {
      totalGames = await FlameEntry.countDocuments();
    } else {
      totalGames = localStore.getAll().length;
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalGames,
        engineStatus: dbStatus.mode
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Unable to retrieve stats'
    });
  }
};
