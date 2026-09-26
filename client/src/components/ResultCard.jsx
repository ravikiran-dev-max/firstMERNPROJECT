import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { FLAMES_CONFIG } from '../utils/flamesEngine';
import { sounds } from '../utils/soundEffects';

const ResultCard = ({ data, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const {
    name1,
    name2,
    resultKey,
    resultName,
    remainingCount,
    matchedLetters,
    eliminationSteps,
    isPerfectMatch
  } = data;

  const config = FLAMES_CONFIG[resultKey] || FLAMES_CONFIG['L'];

  useEffect(() => {
    // Launch celebratory confetti
    sounds.playFanfare();

    try {
      // Confetti burst from both sides
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ff4b91', '#8b5cf6', '#00dfd8', '#ffd166']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ff4b91', '#8b5cf6', '#00dfd8', '#ffd166']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch (e) {
      console.log('Confetti effect skipped', e);
    }
  }, [resultKey]);

  const handleCopyShare = async () => {
    const text = `🔥 FLAMES Result for ${name1} & ${name2}:
${config.icon} ${resultName.toUpperCase()}!
"${config.quote}"
Compatibility Score: ${config.score}%
Check your FLAMES connection now!`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      sounds.playChime();
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // Fallback
    }
  };

  return (
    <div className="card glass-panel border-0 text-white p-4 p-md-5 my-3 shadow-lg animate-pop-in" style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}>
      {/* Top Tag & Pair */}
      <div className="text-center mb-4">
        <span className="glass-pill px-3 py-1 mb-3 text-warning">
          <i className="bi bi-stars me-1"></i> Cosmic Compatibility Result
        </span>

        <h2 className="display-6 fw-bold mb-1">
          <span className="text-white">{name1}</span>
          <span className="mx-2 text-danger animate-heart-pulse d-inline-block">❤️</span>
          <span className="text-white">{name2}</span>
        </h2>
        <p className="text-muted small">The stars have spoken through the FLAMES code.</p>
      </div>

      {/* Main Result Reveal Card */}
      <div
        className="p-4 p-md-5 rounded-4 text-center my-3 position-relative overflow-hidden"
        style={{
          background: config.gradientStyle,
          boxShadow: `0 15px 35px -5px ${config.themeColor}66`
        }}
      >
        {/* Subtle Backdrop Pattern */}
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            fontSize: '8rem',
            opacity: 0.15,
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        >
          {config.icon}
        </div>

        {/* Bouncing Result Icon */}
        <div className="my-2">
          <span
            className="animate-bounce-icon display-1 d-inline-block filter-drop-shadow"
            role="img"
            aria-label={config.symbolName}
            style={{ fontSize: '5.5rem' }}
          >
            {config.icon}
          </span>
        </div>

        {/* Result Name */}
        <h1 className="display-4 fw-black text-white text-uppercase tracking-wider mb-2" style={{ textShadow: '0 4px 12px rgba(0, 0, 0, 0.4)' }}>
          {resultName}
        </h1>

        {/* Badge */}
        <div className="mb-3">
          <span className="badge rounded-pill bg-white text-dark px-3 py-2 fw-bold fs-6 shadow-sm">
            {config.badge}
          </span>
        </div>

        {/* Quote */}
        <p className="lead fw-medium text-white mb-0 mx-auto" style={{ maxWidth: '580px', textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}>
          "{config.quote}"
        </p>
      </div>

      {/* Compatibility Meter */}
      <div className="my-4 p-4 rounded-4" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-semibold small text-light">
            <i className="bi bi-speedometer2 me-1 text-info"></i> Compatibility Rating
          </span>
          <span className="fw-bold fs-5 text-gradient">{config.score}% Match</span>
        </div>

        <div className="compat-progress">
          <div
            className="compat-progress-bar"
            style={{
              width: `${config.score}%`,
              background: config.gradientStyle
            }}
          ></div>
        </div>

        <div className="row g-3 mt-3 pt-2 text-center text-md-start">
          <div className="col-12 col-md-6">
            <small className="text-secondary d-block">Relationship Vibe</small>
            <span className="fw-medium text-white">{config.vibe}</span>
          </div>
          <div className="col-12 col-md-6">
            <small className="text-secondary d-block">Oracle Advice</small>
            <span className="fw-medium text-white-50">{config.advice}</span>
          </div>
        </div>
      </div>

      {/* Accordion: Calculation Breakdown */}
      <div className="mb-4">
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="btn btn-sm btn-outline-secondary w-100 rounded-3 py-2 d-flex align-items-center justify-content-between px-3 text-white-50"
        >
          <span>
            <i className="bi bi-calculator me-2"></i>
            How FLAMES determined <strong>{resultName}</strong>
          </span>
          <i className={`bi ${showBreakdown ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
        </button>

        {showBreakdown && (
          <div className="p-3 mt-2 rounded-3 text-start small" style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <ul className="list-unstyled mb-0 d-flex flex-column gap-2 text-secondary">
              <li>
                <strong className="text-light">1. Cleaned Names:</strong> {data.cleanedName1} & {data.cleanedName2}
              </li>
              <li>
                <strong className="text-light">2. Cancelled Matching Letters:</strong>{' '}
                {matchedLetters && matchedLetters.length > 0 ? (
                  <span className="text-danger fw-bold">{matchedLetters.join(', ')}</span>
                ) : (
                  <span className="text-muted">None (all unique letters)</span>
                )}
              </li>
              <li>
                <strong className="text-light">3. Total Remaining Letters Count:</strong>{' '}
                <span className="badge bg-warning text-dark px-2">{remainingCount}</span>
              </li>
              <li>
                <strong className="text-light">4. Circular Elimination:</strong> Count of {remainingCount} cycled through FLAMES (Friendship, Love, Affection, Marriage, Enemy, Sibling).
              </li>
              <li>
                <strong className="text-light">5. Final Standing Letter:</strong>{' '}
                <span className="badge rounded-pill text-white px-3 py-1" style={{ background: config.themeColor }}>
                  {resultKey} = {resultName} ({config.icon})
                </span>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
        <button
          onClick={handleCopyShare}
          className="btn btn-flames-secondary py-3 px-4 rounded-4"
          title="Copy result text to clipboard"
        >
          <i className={`bi ${copied ? 'bi-check2-circle text-success' : 'bi-share-fill'}`}></i>
          {copied ? 'Copied to Clipboard!' : 'Share Result'}
        </button>

        <button
          onClick={onReset}
          className="btn btn-flames-primary py-3 px-4 rounded-4"
        >
          <i className="bi bi-arrow-repeat"></i> Test Another Pair 🔥
        </button>
      </div>
    </div>
  );
};

export default ResultCard;
