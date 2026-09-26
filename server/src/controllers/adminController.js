import FlameEntry from '../models/FlameEntry.js';
import { dbStatus, localStore } from '../config/db.js';

// Verify admin key middleware
export const verifyAdminMiddleware = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'] || req.query.adminKey || req.body?.adminKey;
  const expectedKey = process.env.ADMIN_SECRET_KEY || 'flamesadmin2026';

  if (!adminKey || adminKey !== expectedKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or missing Admin Secret Key.'
    });
  }

  next();
};

// Simple auth check route for frontend admin gate
export const checkAdminAuth = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Admin authorization valid',
    dbMode: dbStatus.mode
  });
};

/**
 * Get all entries for Admin dashboard with search, filter, and pagination
 * GET /api/admin/entries
 */
export const getAdminEntries = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const filterResult = (req.query.filterResult || '').trim().toUpperCase();

    let allList = [];

    if (dbStatus.isConnected) {
      // Build MongoDB query
      const query = {};
      if (search) {
        query.$or = [
          { name1: { $regex: search, $options: 'i' } },
          { name2: { $regex: search, $options: 'i' } }
        ];
      }
      if (filterResult && ['F', 'L', 'A', 'M', 'E', 'S'].includes(filterResult)) {
        query.resultKey = filterResult;
      }

      const [entries, totalCount, aggregateCounts] = await Promise.all([
        FlameEntry.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        FlameEntry.countDocuments(query),
        FlameEntry.aggregate([
          { $group: { _id: '$resultKey', count: { $sum: 1 } } }
        ])
      ]);

      const breakdown = { F: 0, L: 0, A: 0, M: 0, E: 0, S: 0 };
      aggregateCounts.forEach(item => {
        if (item._id && breakdown[item._id] !== undefined) {
          breakdown[item._id] = item.count;
        }
      });

      const totalAll = await FlameEntry.countDocuments();

      return res.status(200).json({
        success: true,
        data: {
          entries,
          pagination: {
            totalEntries: totalCount,
            totalPages: Math.ceil(totalCount / limit) || 1,
            currentPage: page,
            limit
          },
          stats: {
            totalAll,
            breakdown,
            dbMode: dbStatus.mode
          }
        }
      });
    } else {
      // Local fallback mode filtering
      let items = localStore.getAll();

      // Apply search
      if (search) {
        const s = search.toLowerCase();
        items = items.filter(
          item =>
            (item.name1 && item.name1.toLowerCase().includes(s)) ||
            (item.name2 && item.name2.toLowerCase().includes(s))
        );
      }

      // Apply filter
      if (filterResult && ['F', 'L', 'A', 'M', 'E', 'S'].includes(filterResult)) {
        items = items.filter(item => item.resultKey === filterResult);
      }

      const totalCount = items.length;
      const paginated = items.slice(skip, skip + limit);

      const allItems = localStore.getAll();
      const breakdown = { F: 0, L: 0, A: 0, M: 0, E: 0, S: 0 };
      allItems.forEach(item => {
        if (item.resultKey && breakdown[item.resultKey] !== undefined) {
          breakdown[item.resultKey]++;
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          entries: paginated,
          pagination: {
            totalEntries: totalCount,
            totalPages: Math.ceil(totalCount / limit) || 1,
            currentPage: page,
            limit
          },
          stats: {
            totalAll: allItems.length,
            breakdown,
            dbMode: dbStatus.mode
          }
        }
      });
    }
  } catch (error) {
    console.error('[getAdminEntries Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve admin entries.'
    });
  }
};

/**
 * Delete a specific FLAMES entry
 * DELETE /api/admin/entries/:id
 */
export const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;

    if (dbStatus.isConnected) {
      const deleted = await FlameEntry.findByIdAndDelete(id);
      if (!deleted) {
        // Check fallback just in case
        localStore.deleteById(id);
      }
    } else {
      localStore.deleteById(id);
    }

    return res.status(200).json({
      success: true,
      message: 'Entry removed successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete entry.'
    });
  }
};

/**
 * Clear all records (Admin action)
 * POST /api/admin/clear-all
 */
export const clearAllEntries = async (req, res) => {
  try {
    if (dbStatus.isConnected) {
      await FlameEntry.deleteMany({});
    }
    localStore.clearAll();

    return res.status(200).json({
      success: true,
      message: 'All entries have been cleared successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to reset entries.'
    });
  }
};

/**
 * Export entries as CSV
 * GET /api/admin/export-csv
 */
export const exportEntriesCsv = async (req, res) => {
  try {
    let items = [];
    if (dbStatus.isConnected) {
      items = await FlameEntry.find({}).sort({ createdAt: -1 }).lean();
    } else {
      items = localStore.getAll();
    }

    const headers = ['ID', 'Name 1', 'Name 2', 'Result Code', 'Result', 'Remaining Count', 'Timestamp'];
    const rows = items.map(entry => {
      const dateStr = entry.createdAt ? new Date(entry.createdAt).toISOString() : '';
      return [
        `"${entry._id || ''}"`,
        `"${(entry.name1 || '').replace(/"/g, '""')}"`,
        `"${(entry.name2 || '').replace(/"/g, '""')}"`,
        `"${entry.resultKey || ''}"`,
        `"${entry.resultName || ''}"`,
        entry.remainingCount || 0,
        `"${dateStr}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="flames_entries_export.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to export CSV.'
    });
  }
};
