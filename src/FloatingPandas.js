import React, { useEffect, useState } from 'react';
import panda1 from './panda.png';
import panda2 from './pandaa.png';
import './App.css';

const PANDA_SIZE = 90; // larger size

function FloatingPandas() {
  const NUM_PANDAS = 10;

  const [pandas, setPandas] = useState([]);
  const [pinkBounds, setPinkBounds] = useState([]);

  // Get pink sections dynamically
  useEffect(() => {
    const updateBounds = () => {
      const sections = document.querySelectorAll('.chart-container');
      const bounds = Array.from(sections).map(s => s.getBoundingClientRect());
      setPinkBounds(bounds);
    };
    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  // Generate initial positions outside pink sections
  useEffect(() => {
    if (pinkBounds.length === 0) return;

    const newPandas = [];
    for (let i = 0; i < NUM_PANDAS; i++) {
      let x, y, overlap;
      do {
        x = Math.random() * (window.innerWidth - PANDA_SIZE);
        y = Math.random() * (window.innerHeight - PANDA_SIZE);
        overlap = pinkBounds.some(b => x + PANDA_SIZE > b.left && x < b.right && y + PANDA_SIZE > b.top && y < b.bottom);
        // Also check against existing pandas to prevent clustering
        if (!overlap) {
          overlap = newPandas.some(p => {
            const dx = p.x - x;
            const dy = p.y - y;
            return Math.sqrt(dx * dx + dy * dy) < PANDA_SIZE + 20;
          });
        }
      } while (overlap);
      newPandas.push({
        x,
        y,
        dx: 1 + Math.random() * 2,
        dy: 1 + Math.random() * 2,
        src: i < NUM_PANDAS / 2 ? panda1 : panda2,
      });
    }
    setPandas(newPandas);
  }, [pinkBounds]);

  // Movement loop
  useEffect(() => {
    const interval = setInterval(() => {
      setPandas(prev =>
        prev.map((p, idx) => {
          let newX = p.x + p.dx;
          let newY = p.y + p.dy;

          // Bounce from pink sections
          pinkBounds.forEach(b => {
            const overlapX = newX + PANDA_SIZE > b.left && newX < b.right;
            const overlapY = newY + PANDA_SIZE > b.top && newY < b.bottom;
            if (overlapX && overlapY) {
              if (overlapX) p.dx = -p.dx;
              if (overlapY) p.dy = -p.dy;
              newX = p.x + p.dx;
              newY = p.y + p.dy;
            }
          });

          // Bounce from window edges
          if (newX <= 0 || newX + PANDA_SIZE >= window.innerWidth) p.dx = -p.dx;
          if (newY <= 0 || newY + PANDA_SIZE >= window.innerHeight) p.dy = -p.dy;

          // Bounce from other pandas
          prev.forEach((other, j) => {
            if (idx === j) return;
            const dx = newX - other.x;
            const dy = newY - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < PANDA_SIZE) {
              // Simple bounce: reverse direction
              p.dx = -p.dx;
              p.dy = -p.dy;
              newX = p.x + p.dx;
              newY = p.y + p.dy;
            }
          });

          return { ...p, x: newX, y: newY };
        })
      );
    }, 30);

    return () => clearInterval(interval);
  }, [pinkBounds]);

  return (
    <>
      {pandas.map((p, i) => (
        <img
          key={i}
          src={p.src}
          alt={`panda${i}`}
          style={{
            position: 'fixed',
            left: p.x,
            top: p.y,
            width: PANDA_SIZE,
            height: PANDA_SIZE,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      ))}
    </>
  );
}

export default FloatingPandas;
