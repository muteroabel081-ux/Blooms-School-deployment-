'use client';

import { useMemo } from 'react';

export default function FloatingBubbles() {
  const bubbles = useMemo(() => {
    const items: React.ReactNode[] = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      const size = 8 + Math.random() * 40;
      items.push(
        <div
          key={`bubble-${i}`}
          className="liquid-bubble"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${Math.random() * 100}%`,
            '--duration': `${12 + Math.random() * 18}s`,
            '--delay': `${Math.random() * 15}s`,
            opacity: 0.15 + Math.random() * 0.2,
          } as React.CSSProperties}
        />
      );
    }
    return items;
  }, []);

  return <div className="bubbles-container">{bubbles}</div>;
}