import React, { useState } from 'react';
import { sounds } from '../utils/soundEffects';

const QUICK_PAIRS = [
  { name1: 'Romeo', name2: 'Juliet', emoji: '🌹' },
  { name1: 'Jack', name2: 'Rose', emoji: '🚢' },
  { name1: 'Barbie', name2: 'Ken', emoji: '🎀' },
  { name1: 'Harry', name2: 'Hermione', emoji: '⚡' }
];

const FlamesInputCard = ({ onSubmit, loading }) => {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const clean1 = name1.trim().replace(/[^a-zA-Z]/g, '');
    const clean2 = name2.trim().replace(/[^a-zA-Z]/g, '');

    if (!clean1 || !clean2) {
      setError('Please enter letters for both names!');
      sounds.playPop(200);
      return;
    }

    if (clean1.length < 2 || clean2.length < 2) {
      setError('Each name must be at least 2 letters long.');
      sounds.playPop(200);
      return;
    }

    sounds.playPop(600);
    onSubmit(name1.trim(), name2.trim());
  };

  const setPreset = (n1, n2) => {
    setName1(n1);
    setName2(n2);
    setError('');
    sounds.playPop(500);
  };

  return (
    <div className="card glass-panel glass-panel-hover border-0 text-white p-4 p-md-5 my-3 shadow-lg">
      {/* Title */}
      <div className="text-center mb-4">
        <span className="glass-pill px-3 py-1 mb-3 text-warning">
          <i className="bi bi-magic me-1"></i> The Original Relationship Oracle
        </span>
        <h2 className="display-6 fw-bold mb-2">
          Discover Your <span className="text-gradient">Destiny</span>
        </h2>
        <p className="text-muted" style={{ maxWidth: '480px', margin: '0 auto' }}>
          Enter two names below to unveil the celestial bond written in your stars!
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="alert alert-danger bg-danger-subtle text-danger border border-danger-subtle rounded-4 d-flex align-items-center gap-2 mb-4 animate-pop-in" role="alert">
          <i className="bi bi-exclamation-triangle-fill fs-5"></i>
          <div>{error}</div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit}>
        <div className="row g-3 mb-4">
          {/* Name 1 */}
          <div className="col-12 col-md-6">
            <label htmlFor="name1Input" className="form-label small fw-bold text-uppercase text-secondary mb-2">
              Your Name / Person 1
            </label>
            <div className="flames-input-group">
              <input
                id="name1Input"
                type="text"
                className="flames-input"
                placeholder="e.g. Romeo"
                value={name1}
                maxLength={40}
                autoComplete="off"
                onChange={(e) => {
                  setName1(e.target.value);
                  if (error) setError('');
                }}
                disabled={loading}
              />
              <span className="flames-input-icon">👤</span>
            </div>
          </div>

          {/* Name 2 */}
          <div className="col-12 col-md-6">
            <label htmlFor="name2Input" className="form-label small fw-bold text-uppercase text-secondary mb-2">
              Crush / Partner / Person 2
            </label>
            <div className="flames-input-group">
              <input
                id="name2Input"
                type="text"
                className="flames-input"
                placeholder="e.g. Juliet"
                value={name2}
                maxLength={40}
                autoComplete="off"
                onChange={(e) => {
                  setName2(e.target.value);
                  if (error) setError('');
                }}
                disabled={loading}
              />
              <span className="flames-input-icon">💖</span>
            </div>
          </div>
        </div>

        {/* Quick Test Presets */}
        <div className="mb-4">
          <small className="text-secondary d-block mb-2 fw-semibold">
            <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Quick Test Pairs:
          </small>
          <div className="d-flex flex-wrap gap-2">
            {QUICK_PAIRS.map((pair, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-sm btn-outline-light rounded-pill px-3 py-1 text-light border-0"
                style={{ background: 'rgba(255, 255, 255, 0.08)' }}
                onClick={() => setPreset(pair.name1, pair.name2)}
                disabled={loading}
              >
                <span className="me-1">{pair.emoji}</span>
                {pair.name1} & {pair.name2}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center mt-4">
          <button
            type="submit"
            id="calculateFlamesBtn"
            className="btn btn-flames-primary w-100 py-3 rounded-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Calculating Stars...</span>
              </>
            ) : (
              <>
                <span>Calculate FLAMES</span>
                <span className="fs-5">🔥</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlamesInputCard;
