import React, { useEffect, useState } from 'react';
import { FLAMES_CONFIG } from '../utils/flamesEngine';
import { sounds } from '../utils/soundEffects';

const FlamesVisualizer = ({ calculationData, onComplete }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [eliminatedLetters, setEliminatedLetters] = useState([]);
  const [activeLetter, setActiveLetter] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Analyzing matching letters...');

  const {
    name1,
    name2,
    cleanedName1,
    cleanedName2,
    matchedLetters,
    remainingLetters1,
    remainingLetters2,
    remainingCount,
    eliminationSteps,
    resultKey
  } = calculationData;

  useEffect(() => {
    sounds.playWhoosh();
    // Step 1: Show matched letters elimination
    const timer1 = setTimeout(() => {
      setStatusMessage(`Found ${matchedLetters.length} common character pairs. Striking them out!`);
      sounds.playPop(520);
    }, 800);

    // Step 2: Show remaining count
    const timer2 = setTimeout(() => {
      setStatusMessage(`Total remaining characters: ${remainingCount}. Cycling FLAMES wheel...`);
      sounds.playChime();
    }, 1800);

    let stepTimers = [];
    if (eliminationSteps && eliminationSteps.length > 0) {
      eliminationSteps.forEach((step, idx) => {
        const stepTimer = setTimeout(() => {
          setActiveLetter(step.eliminatedLetter);
          sounds.playPop(350 + idx * 50);
          setEliminatedLetters(prev => [...prev, step.eliminatedLetter]);
          setStatusMessage(`Count reached! Eliminating: ${step.eliminatedName} (${step.eliminatedLetter})`);
          setCurrentStepIdx(idx + 1);

          // If final step
          if (idx === eliminationSteps.length - 1) {
            setTimeout(() => {
              setStatusMessage('Destiny decided! Revealing final bond...');
              sounds.playFanfare();
              setTimeout(() => {
                onComplete();
              }, 1000);
            }, 800);
          }
        }, 2600 + idx * 750);

        stepTimers.push(stepTimer);
      });
    } else {
      // Perfect match case (0 remaining)
      const instantTimer = setTimeout(() => {
        sounds.playFanfare();
        onComplete();
      }, 2500);
      stepTimers.push(instantTimer);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      stepTimers.forEach(t => clearTimeout(t));
    };
  }, [calculationData, eliminationSteps, matchedLetters.length, onComplete, remainingCount]);

  // Helper to render letters with strikethrough if matched
  const renderStruckLetters = (originalStr, remainingStr) => {
    let pool = remainingStr.split('');
    return originalStr.split('').map((char, index) => {
      const lower = char.toLowerCase();
      const pos = pool.indexOf(lower);
      const isKept = pos !== -1;
      if (isKept) {
        pool.splice(pos, 1);
      }
      return (
        <span
          key={index}
          className={`strike-letter ${!isKept ? 'cancelled' : 'text-white'}`}
          style={{ fontSize: '1.4rem' }}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div className="card glass-panel border-0 text-white p-4 p-md-5 text-center shadow-lg my-3">
      {/* Top Header */}
      <div className="mb-4">
        <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 text-uppercase mb-2">
          <i className="bi bi-cpu-fill me-1 animate-spin"></i> Calculating Cosmic Frequency
        </span>
        <h3 className="fw-bold mt-2">Connecting Your Energies</h3>
        <p className="text-secondary small">{statusMessage}</p>
      </div>

      {/* Cross-Cancellation Visualizer */}
      <div className="row g-3 justify-content-center align-items-center my-2">
        <div className="col-12 col-md-5">
          <div className="p-3 rounded-4" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span className="text-muted small d-block mb-1">Person 1</span>
            <div className="d-flex justify-content-center flex-wrap gap-1">
              {renderStruckLetters(cleanedName1, remainingLetters1)}
            </div>
          </div>
        </div>

        <div className="col-12 col-md-2 my-2 my-md-0">
          <div className="d-inline-flex align-items-center justify-content-center rounded-circle" style={{ width: '48px', height: '48px', background: 'rgba(255, 42, 133, 0.2)', border: '1px solid #ff4b91' }}>
            <span className="text-gradient fw-bold">VS</span>
          </div>
        </div>

        <div className="col-12 col-md-5">
          <div className="p-3 rounded-4" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span className="text-muted small d-block mb-1">Person 2</span>
            <div className="d-flex justify-content-center flex-wrap gap-1">
              {renderStruckLetters(cleanedName2, remainingLetters2)}
            </div>
          </div>
        </div>
      </div>

      {/* Remaining Count Badge */}
      <div className="my-3">
        <span className="glass-pill px-3 py-2">
          <span className="text-warning">Remaining Magic Letters:</span>
          <strong className="fs-5 text-white">{remainingCount}</strong>
        </span>
      </div>

      {/* FLAMES Letters Wheel */}
      <div className="d-flex justify-content-center flex-wrap gap-2 gap-md-3 my-4">
        {['F', 'L', 'A', 'M', 'E', 'S'].map(letter => {
          const isEliminated = eliminatedLetters.includes(letter);
          const isWinner = resultKey === letter && eliminatedLetters.length === 5;
          const config = FLAMES_CONFIG[letter];

          return (
            <div
              key={letter}
              className={`flame-badge-item ${isWinner ? 'active' : ''} ${isEliminated ? 'eliminated' : ''}`}
              style={{
                borderColor: isWinner ? config.themeColor : undefined,
                boxShadow: isWinner ? `0 0 25px ${config.themeColor}` : undefined
              }}
            >
              <span className="letter" style={{ color: isWinner ? '#fff' : (isEliminated ? '#64748b' : config.themeColor) }}>
                {letter}
              </span>
              <span className="icon">{config.icon}</span>
            </div>
          );
        })}
      </div>

      {/* Skip Button */}
      <div className="mt-3">
        <button
          onClick={onComplete}
          className="btn btn-sm btn-outline-secondary rounded-pill px-4 py-2"
        >
          Skip Animation <i className="bi bi-chevron-double-right ms-1"></i>
        </button>
      </div>
    </div>
  );
};

export default FlamesVisualizer;
