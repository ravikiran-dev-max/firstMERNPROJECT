import { calculateFlamesLocally } from './flamesEngine.js';

// Resolve backend API URL from environment variable (for Vercel deployment)
// Falls back to relative '/api' for Vite dev proxy
const RAW_API_URL = (import.meta.env.VITE_API_URL || '').trim();
const CLEAN_API_URL = RAW_API_URL.replace(/\/+$/, '');
export const API_BASE = CLEAN_API_URL
  ? (CLEAN_API_URL.endsWith('/api') ? CLEAN_API_URL : `${CLEAN_API_URL}/api`)
  : '/api';

/**
 * Play FLAMES API call
 */
export async function playFlamesApi(name1, name2) {
  try {
    const res = await fetch(`${API_BASE}/flames/play`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name1, name2 })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to calculate FLAMES result');
    }
    return data.data;
  } catch (err) {
    // If backend isn't reachable, perform instant client-side calculation
    console.warn('[API Warning] Backend unreachable or failed, calculating locally:', err.message);
    const localCalc = calculateFlamesLocally(name1, name2);
    return {
      ...localCalc,
      id: 'offline_' + Date.now(),
      timestamp: new Date().toISOString(),
      isOffline: true
    };
  }
}

/**
 * Get public game stats
 */
export async function getPublicStatsApi() {
  try {
    const res = await fetch(`${API_BASE}/flames/stats`);
    if (!res.ok) throw new Error('Failed to load stats');
    const data = await res.json();
    return data.stats;
  } catch (err) {
    return { totalGames: 0, engineStatus: 'client-only' };
  }
}

/**
 * Verify admin credentials
 */
export async function verifyAdminKeyApi(adminKey) {
  const res = await fetch(`${API_BASE}/admin/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': adminKey
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Invalid Admin Secret Key');
  }
  return data;
}

/**
 * Get all entries for Admin with search, filter, pagination
 */
export async function getAdminEntriesApi({ adminKey, page = 1, limit = 15, search = '', filterResult = '' }) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search: search || '',
    filterResult: filterResult || ''
  });

  const res = await fetch(`${API_BASE}/admin/entries?${params.toString()}`, {
    headers: {
      'x-admin-key': adminKey
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Could not fetch admin entries');
  }
  return data.data;
}

/**
 * Delete a specific entry
 */
export async function deleteAdminEntryApi(adminKey, id) {
  const res = await fetch(`${API_BASE}/admin/entries/${id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-key': adminKey
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete record');
  }
  return data;
}

/**
 * Clear all entries
 */
export async function clearAllAdminEntriesApi(adminKey) {
  const res = await fetch(`${API_BASE}/admin/clear-all`, {
    method: 'POST',
    headers: {
      'x-admin-key': adminKey
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to clear all records');
  }
  return data;
}

/**
 * Export CSV URL
 */
export function getExportCsvUrl(adminKey) {
  return `${API_BASE}/admin/export-csv?adminKey=${encodeURIComponent(adminKey)}`;
}
