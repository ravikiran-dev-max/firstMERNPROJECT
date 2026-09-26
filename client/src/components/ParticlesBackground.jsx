import React, { useMemo } from 'react';

const ParticlesBackground = () => {
  const particles = useMemo(() => {
    const symbols = ['❤️', '✨', '🔥', '💫', '💖', '⭐', '🌸'];
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      symbol: symbols[i % symbols.length],
      left: Math.random() * 95,
      animationDuration: 12 + Math.random() * 10,
      animationDelay: Math.random() * 10,
      fontSize: 14 + Math.random() * 16,
      opacity: 0.15 + Math.random() * 0.25
    }));
  }, []);

  return (
    <div className="particles-container">
      {particles.map(p => (
        <span
          key={p.id}
          className="floating-heart"
          style={{
            left: `${p.left}%`,
            animationDuration: `${p.animationDuration}s`,
            animationDelay: `${p.animationDelay}s`,
            fontSize: `${p.fontSize}px`,
            opacity: p.opacity
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
};

export default ParticlesBackground;
