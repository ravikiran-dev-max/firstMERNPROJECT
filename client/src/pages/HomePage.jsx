import React, { useState, useEffect } from 'react';
import FlamesInputCard from '../components/FlamesInputCard';
import FlamesVisualizer from '../components/FlamesVisualizer';
import ResultCard from '../components/ResultCard';
import { playFlamesApi, getPublicStatsApi } from '../utils/api';
import { FLAMES_CONFIG } from '../utils/flamesEngine';

const HomePage = () => {
  const [calculationData, setCalculationData] = useState(null);
  const [stage, setStage] = useState('input'); // 'input' | 'animating' | 'result'
  const [loading, setLoading] = useState(false);
  const [globalStats, setGlobalStats] = useState({ totalGames: 0, engineStatus: 'mongodb' });

  useEffect(() => {
    // Load public stats count
    getPublicStatsApi().then(stats => {
      if (stats) setGlobalStats(stats);
    });
  }, []);

  const handleStartCalculation = async (name1, name2) => {
    setLoading(true);
    try {
      const data = await playFlamesApi(name1, name2);
      setCalculationData(data);
      setStage('animating');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error calculating FLAMES.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnimationComplete = () => {
    setStage('result');
    // Refresh stats
    getPublicStatsApi().then(stats => {
      if (stats) setGlobalStats(stats);
    });
  };

  const handleReset = () => {
    setCalculationData(null);
    setStage('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container py-4 py-md-5 position-relative" style={{ zIndex: 1, maxWidth: '900px' }}>
      {/* Top Tagline */}
      <div className="text-center mb-4">
        <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3" style={{ background: 'rgba(255, 42, 133, 0.15)', border: '1px solid rgba(255, 42, 133, 0.3)' }}>
          <span className="text-danger animate-bounce-icon" role="img" aria-label="spark">✨</span>
        </div>
        <h1 className="display-4 fw-black text-white mb-2" style={{ letterSpacing: '-1px' }}>
          FLAMES <span className="text-gradient">RELATIONSHIP</span> RADAR
        </h1>
        <p className="lead text-secondary mx-auto mb-4" style={{ maxWidth: '600px' }}>
          Will it be passionate Love, timeless Marriage, lifelong Friendship, sweet Affection, playful Enemy, or protective Sibling?
        </p>
      </div>

      {/* Dynamic Stages */}
      {stage === 'input' && (
        <FlamesInputCard onSubmit={handleStartCalculation} loading={loading} />
      )}

      {stage === 'animating' && calculationData && (
        <FlamesVisualizer
          calculationData={calculationData}
          onComplete={handleAnimationComplete}
        />
      )}

      {stage === 'result' && calculationData && (
        <ResultCard
          data={calculationData}
          onReset={handleReset}
        />
      )}

      {/* FLAMES Category Showcase Cards */}
      <div className="mt-5 pt-4">
        <div className="text-center mb-4">
          <span className="badge rounded-pill bg-light text-dark px-3 py-2 text-uppercase fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
            The 6 Outcomes of Destiny
          </span>
        </div>

        <div className="row g-3 justify-content-center">
          {Object.values(FLAMES_CONFIG).map(item => (
            <div key={item.code} className="col-6 col-md-4 col-lg-2">
              <div
                className="p-3 rounded-4 text-center h-100 transition-all"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="fs-1 mb-2 animate-float" style={{ animationDelay: `${Math.random() * 2}s` }}>
                  {item.icon}
                </div>
                <div className="fw-bold text-white small mb-1">{item.name}</div>
                <span className="badge rounded-pill" style={{ background: item.themeColor, fontSize: '0.7rem' }}>
                  {item.code}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Counter Footnote */}
      {globalStats.totalGames > 0 && (
        <div className="text-center mt-5">
          <span className="glass-pill px-4 py-2 small text-secondary">
            <i className="bi bi-fire text-danger me-1"></i> Over{' '}
            <strong className="text-white">{globalStats.totalGames}</strong> relationship destinies calculated so far!
          </span>
        </div>
      )}
    </div>
  );
};

export default HomePage;
