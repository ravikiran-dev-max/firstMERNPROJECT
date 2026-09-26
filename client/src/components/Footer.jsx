import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-auto py-4 text-center" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
      <div className="container">
        <p className="mb-1 text-muted small">
          Crafted with <span className="text-danger animate-heart-pulse d-inline-block">❤️</span> for romance, laughs & nostalgia.
        </p>
        <div className="d-flex align-items-center justify-content-center gap-3 small text-secondary">
          <span>FLAMES MERN Edition</span>
          <span>•</span>
          <Link to="/" className="text-secondary text-decoration-none hover-white">Home</Link>
          <span>•</span>
         
        </div>
      </div>
    </footer>
  );
};

export default Footer;
