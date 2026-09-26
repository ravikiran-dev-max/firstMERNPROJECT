import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sounds } from '../utils/soundEffects';
import { FLAMES_CONFIG } from '../utils/flamesEngine';

const Navbar = () => {
  const [soundOn, setSoundOn] = useState(sounds.isSoundEnabled());
  const [showLegend, setShowLegend] = useState(false);
  const navigate = useNavigate();

  const handleToggleSound = () => {
    const nextState = sounds.toggleSound();
    setSoundOn(nextState);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg py-3 px-3 px-md-4 sticky-top" style={{ backdropFilter: 'blur(16px)', background: 'rgba(10, 11, 22, 0.75)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', zIndex: 100 }}>
        <div className="container-fluid max-w-6xl mx-auto">
          {/* Brand */}
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 text-decoration-none">
            <span className="fs-2 animate-bounce-icon" role="img" aria-label="flame">🔥</span>
            <div>
              <span className="h4 mb-0 fw-black text-white text-gradient" style={{ letterSpacing: '1px' }}>FLAMES</span>
              <span className="d-none d-sm-inline-block ms-2 badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 text-uppercase" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                Game Edition
              </span>
            </div>
          </Link>

          {/* Right Action Buttons */}
          <div className="d-flex align-items-center gap-2 gap-md-3">
            {/* Legend / Meaning Trigger */}
            <button
              onClick={() => setShowLegend(true)}
              className="btn btn-sm btn-flames-secondary py-2 px-3 rounded-pill"
              title="View FLAMES Rules & Icons"
            >
              <i className="bi bi-info-circle-fill text-warning me-1"></i>
              <span className="d-none d-md-inline">Meaning of FLAMES</span>
              <span className="d-md-none">Rules</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className={`btn btn-sm ${soundOn ? 'btn-flames-secondary' : 'btn-outline-secondary'} py-2 px-3 rounded-pill`}
              title={soundOn ? 'Mute Sound Effects' : 'Enable Sound Effects'}
            >
              <i className={`bi ${soundOn ? 'bi-volume-up-fill text-info' : 'bi-volume-mute-fill text-secondary'}`}></i>
              <span className="d-none d-sm-inline ms-1">{soundOn ? 'Sound On' : 'Muted'}</span>
            </button>

            {/* Hidden Admin Access Button */}
            <Link
              to="/admin"
              className="btn btn-sm btn-outline-light border-0 py-2 px-2 px-md-3 rounded-pill opacity-75 hover-opacity-100"
              title="Admin Portal (Secret Route)"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            >
              <i className="bi bi-shield-lock-fill text-warning"></i>
              <span className="d-none d-lg-inline ms-1 small"></span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Meaning Modal */}
      {showLegend && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content glass-panel border-0 text-white p-2 p-md-3">
              <div className="modal-header border-0 pb-0">
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-3">📜</span>
                  <div>
                    <h5 className="modal-title fw-bold mb-0">What is FLAMES?</h5>
                    <p className="text-muted small mb-0">The timeless childhood connection oracle</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowLegend(false)}
                  aria-label="Close"
                ></button>
              </div>

              <div className="modal-body py-4">
                <p className="text-secondary small mb-3">
                  FLAMES is a nostalgic relationship acronym game. Common letters in both names are removed, and the total count of remaining letters is used to cycle through the letters <strong>F-L-A-M-E-S</strong>:
                </p>

                <div className="row g-3">
                  {Object.values(FLAMES_CONFIG).map(item => (
                    <div key={item.code} className="col-12 col-sm-6 col-md-4">
                      <div className="p-3 rounded-4 h-100" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="fs-2">{item.icon}</span>
                          <div>
                            <span className="badge rounded-pill" style={{ background: item.themeColor, color: '#fff' }}>
                              Letter {item.code}
                            </span>
                            <h6 className="fw-bold mb-0 mt-1">{item.name}</h6>
                          </div>
                        </div>
                        <p className="small text-muted mb-0">{item.quote}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-flames-primary w-100 rounded-pill py-2"
                  onClick={() => setShowLegend(false)}
                >
                  Got it! Let's Play 🔥
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
