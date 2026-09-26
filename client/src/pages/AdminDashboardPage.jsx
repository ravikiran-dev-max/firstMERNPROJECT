import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  verifyAdminKeyApi,
  getAdminEntriesApi,
  deleteAdminEntryApi,
  clearAllAdminEntriesApi,
  getExportCsvUrl,
  getRawBackendUrl,
  saveCustomBackendUrl,
  isBackendConfigured
} from '../utils/api';
import { FLAMES_CONFIG } from '../utils/flamesEngine';
import { sounds } from '../utils/soundEffects';

const AdminDashboardPage = () => {
  const [adminKey, setAdminKey] = useState(sessionStorage.getItem('flames_admin_key') || '');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Backend connection state
  const [backendUrl, setBackendUrl] = useState(getRawBackendUrl());
  const [showServerConfig, setShowServerConfig] = useState(!isBackendConfigured());
  const [serverSaveSuccess, setServerSaveSuccess] = useState('');

  // Entries and filters
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({ totalAll: 0, breakdown: {}, dbMode: 'mongodb' });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalEntries: 0, limit: 12 });
  const [search, setSearch] = useState('');
  const [filterResult, setFilterResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Verify key on mount if present
  useEffect(() => {
    if (adminKey) {
      verifyAdminKeyApi(adminKey)
        .then(() => {
          setIsAuthorized(true);
        })
        .catch(() => {
          sessionStorage.removeItem('flames_admin_key');
          setAdminKey('');
          setIsAuthorized(false);
        });
    }
  }, [adminKey]);

  // Load entries
  const fetchEntries = useCallback(async (page = 1) => {
    if (!adminKey) return;
    setLoading(true);
    try {
      const data = await getAdminEntriesApi({
        adminKey,
        page,
        limit: 12,
        search,
        filterResult
      });
      setEntries(data.entries || []);
      setPagination(data.pagination || { currentPage: page, totalPages: 1, totalEntries: 0, limit: 12 });
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error(err);
      setActionMessage({ type: 'danger', text: err.message || 'Failed to fetch entries' });
    } finally {
      setLoading(false);
    }
  }, [adminKey, search, filterResult]);

  useEffect(() => {
    if (isAuthorized) {
      fetchEntries(1);
    }
  }, [isAuthorized, search, filterResult, fetchEntries]);

  // Handle Login / Unlock
  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!keyInput.trim()) {
      setAuthError('Please enter the Admin Secret Key.');
      return;
    }

    setVerifying(true);
    setAuthError('');

    try {
      await verifyAdminKeyApi(keyInput.trim());
      sessionStorage.setItem('flames_admin_key', keyInput.trim());
      setAdminKey(keyInput.trim());
      setIsAuthorized(true);
      sounds.playFanfare();
    } catch (err) {
      setAuthError(err.message || 'Invalid Admin Secret Key.');
      sounds.playPop(200);
    } finally {
      setVerifying(false);
    }
  };

  const handleSaveBackendUrl = (e) => {
    if (e) e.preventDefault();
    saveCustomBackendUrl(backendUrl);
    setServerSaveSuccess('Connected! You can now authenticate.');
    setAuthError('');
    setTimeout(() => setServerSaveSuccess(''), 4000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('flames_admin_key');
    setAdminKey('');
    setIsAuthorized(false);
    setKeyInput('');
  };

  // Delete single entry
  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this entry?')) return;
    try {
      await deleteAdminEntryApi(adminKey, id);
      sounds.playPop(400);
      setActionMessage({ type: 'success', text: 'Entry removed successfully.' });
      fetchEntries(pagination.currentPage);
      setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setActionMessage({ type: 'danger', text: err.message || 'Failed to delete entry.' });
    }
  };

  // Clear all
  const handleClearAll = async () => {
    try {
      await clearAllAdminEntriesApi(adminKey);
      sounds.playPop(300);
      setShowClearConfirm(false);
      setActionMessage({ type: 'success', text: 'All entries have been cleared.' });
      fetchEntries(1);
      setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setActionMessage({ type: 'danger', text: err.message || 'Failed to reset entries.' });
    }
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // RENDER: Locked Gate Screen
  if (!isAuthorized) {
    return (
      <div className="container py-5 position-relative" style={{ zIndex: 1, maxWidth: '520px' }}>
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none small text-secondary hover-white">
            <i className="bi bi-arrow-left me-1"></i> Return to FLAMES Game
          </Link>
        </div>

        <div className="card glass-panel border-0 text-white p-4 p-md-5 shadow-lg text-center animate-pop-in">
          <div className="d-inline-flex p-3 rounded-circle mb-3 mx-auto" style={{ background: 'rgba(255, 42, 133, 0.15)', border: '1px solid rgba(255, 42, 133, 0.4)' }}>
            <i className="bi bi-shield-lock-fill text-danger fs-1"></i>
          </div>

          <h2 className="fw-bold mb-2">Restricted Portal</h2>
          <p className="text-muted small mb-4">
            This dashboard is private and only accessible to administrators. Normal users cannot view calculation entries.
          </p>

          {authError && (
            <div className="alert alert-danger bg-danger-subtle text-danger border border-danger-subtle rounded-3 small p-2 mb-3">
              {authError}
            </div>
          )}

          <form onSubmit={handleUnlock}>
            <div className="mb-3 text-start">
              <label className="form-label small text-secondary fw-semibold">Enter Admin Key</label>
              <input
                type="password"
                className="flames-input"
                placeholder="Secret Passcode"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                autoFocus
              />
            </div>


            <button
              type="submit"
              className="btn btn-flames-primary w-100 rounded-3 py-3"
              disabled={verifying}
            >
              {verifying ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Authenticating...
                </>
              ) : (
                <>
                  <i className="bi bi-unlock-fill me-2"></i> Unlock Dashboard
                </>
              )}
            </button>
          </form>

          {/* Backend Connection Panel */}
          <div className="mt-4 pt-3 text-start" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small text-secondary fw-semibold">
                <i className="bi bi-hdd-network me-1"></i> Backend Server
              </span>
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-decoration-none text-info small"
                onClick={() => setShowServerConfig(!showServerConfig)}
              >
                {showServerConfig ? 'Hide' : (backendUrl ? 'Change' : 'Connect')}
              </button>
            </div>

            {backendUrl && !showServerConfig ? (
              <div className="d-flex align-items-center gap-2 p-2 rounded-2 mt-1" style={{ background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.8rem' }}>
                <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle">
                  Connected
                </span>
                <span className="text-truncate text-secondary font-monospace" title={backendUrl}>
                  {backendUrl}
                </span>
              </div>
            ) : null}

            {showServerConfig && (
              <div className="p-3 rounded-3 mt-2" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <label className="text-muted small mb-2 d-block" style={{ fontSize: '0.78rem' }}>
                  Render Backend Service URL:
                </label>
                <div className="input-group input-group-sm mb-2">
                  <input
                    type="url"
                    className="form-control bg-dark text-white border-secondary small font-monospace"
                    placeholder="https://your-service.onrender.com"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-info"
                    onClick={handleSaveBackendUrl}
                  >
                    Save
                  </button>
                </div>
                {serverSaveSuccess && (
                  <span className="text-success small d-block mb-1">
                    <i className="bi bi-check-circle me-1"></i> {serverSaveSuccess}
                  </span>
                )}
                <span className="text-secondary small d-block" style={{ fontSize: '0.72rem' }}>
                  Enter your Render URL here to connect immediately. You can also configure <code>VITE_API_URL</code> in Vercel project settings.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Authorized Admin Dashboard
  return (
    <div className="container-fluid max-w-7xl py-4 py-md-5 position-relative px-3 px-md-4" style={{ zIndex: 1 }}>
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge rounded-pill bg-danger text-white px-3 py-1 text-uppercase small">
              <i className="bi bi-shield-shaded me-1"></i> Admin Command Center
            </span>
            <span className={`badge rounded-pill ${stats.dbMode === 'mongodb' ? 'bg-success-subtle text-success border border-success' : 'bg-warning-subtle text-warning border border-warning'} px-2 py-1 small`}>
              <i className="bi bi-database me-1"></i> {stats.dbMode === 'mongodb' ? 'MongoDB Online' : 'Local Fallback'}
            </span>
          </div>
          <h1 className="h2 fw-bold text-white mb-0">Player Activity & Connection Records</h1>
        </div>

        <div className="d-flex flex-wrap gap-2">
          {/* Export CSV */}
          <a
            href={getExportCsvUrl(adminKey)}
            target="_blank"
            rel="noopener noreferrer"
            download="flames_entries.csv"
            className="btn btn-sm btn-flames-secondary rounded-pill px-3 py-2"
          >
            <i className="bi bi-download text-info me-1"></i> Export CSV
          </a>

          {/* Clear All Trigger */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="btn btn-sm btn-outline-danger rounded-pill px-3 py-2"
            title="Wipe database history"
          >
            <i className="bi bi-trash3-fill me-1"></i> Clear All
          </button>

          {/* Refresh */}
          <button
            onClick={() => fetchEntries(pagination.currentPage)}
            className="btn btn-sm btn-outline-light rounded-pill px-3 py-2"
            title="Refresh data"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="btn btn-sm btn-danger rounded-pill px-3 py-2"
          >
            <i className="bi bi-box-arrow-right me-1"></i> Lock
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage.text && (
        <div className={`alert alert-${actionMessage.type} bg-${actionMessage.type}-subtle text-${actionMessage.type} border border-${actionMessage.type}-subtle rounded-3 small py-2 px-3 mb-4 animate-pop-in d-flex align-items-center justify-content-between`}>
          <span>{actionMessage.text}</span>
          <button type="button" className="btn-close" onClick={() => setActionMessage({ type: '', text: '' })}></button>
        </div>
      )}

      {/* Outcome Breakdown Cards */}
      <div className="row g-3 mb-4">
        {/* Total Games */}
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card glass-panel border-0 text-white p-3 h-100 text-center">
            <span className="text-secondary small fw-semibold text-uppercase">Total Games</span>
            <div className="display-6 fw-bold text-white my-1">{stats.totalAll || 0}</div>
            <span className="badge bg-secondary-subtle text-light rounded-pill">All Records</span>
          </div>
        </div>

        {/* F - Friendship */}
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card glass-panel border-0 text-white p-3 h-100 text-center" style={{ borderLeft: '3px solid #0ea5e9' }}>
            <span className="text-secondary small fw-semibold">🤝 Friendship</span>
            <div className="display-6 fw-bold text-info my-1">{stats.breakdown?.F || 0}</div>
            <span className="small text-muted">BFFs</span>
          </div>
        </div>

        {/* L - Love */}
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card glass-panel border-0 text-white p-3 h-100 text-center" style={{ borderLeft: '3px solid #f43f5e' }}>
            <span className="text-secondary small fw-semibold">❤️ Love</span>
            <div className="display-6 fw-bold text-danger my-1">{stats.breakdown?.L || 0}</div>
            <span className="small text-muted">Romantic</span>
          </div>
        </div>

        {/* A - Affection */}
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card glass-panel border-0 text-white p-3 h-100 text-center" style={{ borderLeft: '3px solid #ec4899' }}>
            <span className="text-secondary small fw-semibold">😊 Affection</span>
            <div className="display-6 fw-bold text-warning my-1">{stats.breakdown?.A || 0}</div>
            <span className="small text-muted">Fondness</span>
          </div>
        </div>

        {/* M - Marriage */}
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card glass-panel border-0 text-white p-3 h-100 text-center" style={{ borderLeft: '3px solid #8b5cf6' }}>
            <span className="text-secondary small fw-semibold">💍 Marriage</span>
            <div className="display-6 fw-bold text-primary my-1">{stats.breakdown?.M || 0}</div>
            <span className="small text-muted">Soulmates</span>
          </div>
        </div>

        {/* E - Enemy & S - Sibling */}
        <div className="col-6 col-md-4 col-lg-2">
          <div className="card glass-panel border-0 text-white p-3 h-100 text-center" style={{ borderLeft: '3px solid #10b981' }}>
            <span className="text-secondary small fw-semibold">⚔️ / 👨‍👩‍👧‍👦 Rivals/Fam</span>
            <div className="d-flex justify-content-center gap-2 my-1">
              <span className="h4 fw-bold text-danger mb-0" title="Enemies">{stats.breakdown?.E || 0}</span>
              <span className="text-muted">/</span>
              <span className="h4 fw-bold text-success mb-0" title="Siblings">{stats.breakdown?.S || 0}</span>
            </div>
            <span className="small text-muted">Rival / Sibling</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card glass-panel border-0 p-3 mb-4">
        <div className="row g-3 align-items-center">
          {/* Search Box */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary"
                placeholder="Search by any name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="btn btn-outline-secondary" onClick={() => setSearch('')}>
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>

          {/* Result Filter */}
          <div className="col-12 col-sm-6 col-md-4 col-lg-3">
            <select
              className="form-select bg-dark text-white border-secondary"
              value={filterResult}
              onChange={(e) => setFilterResult(e.target.value)}
            >
              <option value="">All Results (F-L-A-M-E-S)</option>
              <option value="F">🤝 Friendship (F)</option>
              <option value="L">❤️ Love (L)</option>
              <option value="A">😊 Affection (A)</option>
              <option value="M">💍 Marriage (M)</option>
              <option value="E">⚔️ Enemy (E)</option>
              <option value="S">👨‍👩‍👧‍👦 Sibling (S)</option>
            </select>
          </div>

          {/* Result summary tag */}
          <div className="col-12 col-sm-6 col-md-2 text-md-end ms-auto text-secondary small">
            Showing <strong>{entries.length}</strong> of <strong>{pagination.totalEntries}</strong> entries
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="card glass-panel border-0 overflow-hidden shadow-lg mb-4">
        <div className="table-responsive">
          <table className="table table-dark-custom align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>Pairing Names</th>
                <th>Relationship Result</th>
                <th>Count (N)</th>
                <th>Timestamp</th>
                <th className="text-end" style={{ width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-secondary">
                    <div className="spinner-border spinner-border-sm text-danger me-2"></div>
                    Loading entries...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-secondary">
                    <i className="bi bi-inbox fs-2 d-block mb-2 text-muted"></i>
                    No calculation entries found.
                  </td>
                </tr>
              ) : (
                entries.map((entry, idx) => {
                  const config = FLAMES_CONFIG[entry.resultKey] || FLAMES_CONFIG['L'];
                  const rowNum = (pagination.currentPage - 1) * pagination.limit + idx + 1;

                  return (
                    <tr key={entry._id || idx}>
                      {/* Row Num */}
                      <td className="text-secondary small fw-bold">{rowNum}</td>

                      {/* Names */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-bold text-white fs-6">{entry.name1}</span>
                          <span className="text-danger small">❤️</span>
                          <span className="fw-bold text-white fs-6">{entry.name2}</span>
                        </div>
                        {entry.matchedLetters && entry.matchedLetters.length > 0 && (
                          <small className="text-secondary" style={{ fontSize: '0.75rem' }}>
                            Cancelled: {entry.matchedLetters.join(', ')}
                          </small>
                        )}
                      </td>

                      {/* Result */}
                      <td>
                        <span
                          className="badge rounded-pill px-3 py-2 d-inline-flex align-items-center gap-2"
                          style={{
                            background: `${config.themeColor}22`,
                            color: config.themeColor,
                            border: `1px solid ${config.themeColor}55`
                          }}
                        >
                          <span className="fs-6">{config.icon}</span>
                          <span className="fw-bold">{entry.resultName}</span>
                          <small className="opacity-75">({entry.resultKey})</small>
                        </span>
                      </td>

                      {/* Count */}
                      <td>
                        <span className="badge bg-dark border border-secondary text-warning px-2 py-1">
                          N = {entry.remainingCount ?? 0}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td>
                        <span className="text-secondary small">
                          <i className="bi bi-clock me-1"></i>
                          {formatDate(entry.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="text-end">
                        <button
                          onClick={() => handleDeleteEntry(entry._id)}
                          className="btn btn-sm btn-outline-danger border-0 rounded-circle p-2"
                          title="Delete entry"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center p-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <span className="small text-secondary">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-light rounded-pill px-3"
                disabled={pagination.currentPage <= 1 || loading}
                onClick={() => fetchEntries(pagination.currentPage - 1)}
              >
                <i className="bi bi-chevron-left me-1"></i> Prev
              </button>
              <button
                className="btn btn-sm btn-outline-light rounded-pill px-3"
                disabled={pagination.currentPage >= pagination.totalPages || loading}
                onClick={() => fetchEntries(pagination.currentPage + 1)}
              >
                Next <i className="bi bi-chevron-right ms-1"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Clear All */}
      {showClearConfirm && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-panel border-0 text-white p-3">
              <div className="modal-header border-0">
                <h5 className="modal-title text-danger fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i> Wipe All Entries?
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowClearConfirm(false)}></button>
              </div>
              <div className="modal-body text-secondary small py-2">
                This will irreversibly delete all recorded game entries from the database. Are you absolutely certain?
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setShowClearConfirm(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger rounded-pill px-4" onClick={handleClearAll}>
                  Yes, Wipe Everything
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
