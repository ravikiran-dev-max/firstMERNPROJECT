import { calculateFlamesLocally } from './flamesEngine.js';

/**
 * Dynamically resolves the API base URL:
 * 1. Checks localStorage for a user-specified custom backend URL (for instant browser setup)
 * 2. Checks build-time environment variable VITE_API_URL (configured in Vercel)
 * 3. Falls back to '/api' (for local Vite dev proxy)
 */
export function getApiBaseUrl() {
  let customUrl = null;
  if (typeof window !== 'undefined') {
    try {
      customUrl = localStorage.getItem('flames_custom_backend_url');
    } catch {
      // Ignore localStorage exceptions
    }
  }

  const rawUrl = (customUrl || import.meta.env.VITE_API_URL || '').trim();
  const cleanUrl = rawUrl.replace(/\/+$/, '');

  if (cleanUrl) {
    return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
  }
  return '/api';
}

/**
 * Returns the raw configured backend URL without /api suffix
 */
export function getRawBackendUrl() {
  if (typeof window !== 'undefined') {
    try {
      const custom = localStorage.getItem('flames_custom_backend_url');
      if (custom) return custom;
    } catch {
      // Ignore
    }
  }
  return (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
}

/**
 * Save or clear custom backend URL in localStorage
 */
export function saveCustomBackendUrl(url) {
  if (typeof window === 'undefined') return;
  try {
    const trimmed = (url || '').trim().replace(/\/+$/, '');
    if (!trimmed) {
      localStorage.removeItem('flames_custom_backend_url');
    } else {
      localStorage.setItem('flames_custom_backend_url', trimmed);
    }
  } catch (err) {
    console.error('Failed to save custom backend URL in localStorage:', err);
  }
}

/**
 * Helper to check if a backend URL has been explicitly configured
 */
export function isBackendConfigured() {
  return Boolean(getRawBackendUrl());
}

/**
 * Robust JSON fetch wrapper with descriptive errors for deployment issues
 */
async function requestApi(endpoint, options = {}) {
  const apiBase = getApiBaseUrl();
  const fullUrl = `${apiBase}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let res;
  try {
    res = await fetch(fullUrl, options);
  } catch (netErr) {
    const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    if (!isLocalhost && !isBackendConfigured()) {
      throw new Error('Backend URL is not connected. Enter your Render backend URL below to connect.');
    }
    throw new Error(`Cannot connect to backend (${netErr.message}). If using Render free tier, server may be waking up (~30s). Please retry.`);
  }

  // Detect HTML response (which happens when Vercel static rewrites catch a missing /api route)
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html') || res.status === 404) {
    if (apiBase === '/api') {
      throw new Error('Backend URL not connected on Vercel! Enter your Render URL below (e.g. https://your-service.onrender.com) or set VITE_API_URL in Vercel settings.');
    }
    throw new Error(`Backend endpoint ${endpoint} not found (404) on ${apiBase}.`);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Server responded with status ${res.status}`);
  }
  return data;
}

/**
 * Play FLAMES API call
 */
export async function playFlamesApi(name1, name2) {
  try {
    const data = await requestApi('/flames/play', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name1, name2 })
    });
    return data.data;
  } catch (err) {
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
    const data = await requestApi('/flames/stats');
    return data.stats;
  } catch (err) {
    return { totalGames: 0, engineStatus: 'client-only' };
  }
}

/**
 * Verify admin credentials
 */
export async function verifyAdminKeyApi(adminKey) {
  return await requestApi('/admin/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': adminKey
    }
  });
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

  const data = await requestApi(`/admin/entries?${params.toString()}`, {
    headers: {
      'x-admin-key': adminKey
    }
  });
  return data.data;
}

/**
 * Delete a specific entry
 */
export async function deleteAdminEntryApi(adminKey, id) {
  return await requestApi(`/admin/entries/${id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-key': adminKey
    }
  });
}

/**
 * Clear all entries
 */
export async function clearAllAdminEntriesApi(adminKey) {
  return await requestApi('/admin/clear-all', {
    method: 'POST',
    headers: {
      'x-admin-key': adminKey
    }
  });
}

/**
 * Export CSV URL
 */
export function getExportCsvUrl(adminKey) {
  return `${getApiBaseUrl()}/admin/export-csv?adminKey=${encodeURIComponent(adminKey)}`;
}
