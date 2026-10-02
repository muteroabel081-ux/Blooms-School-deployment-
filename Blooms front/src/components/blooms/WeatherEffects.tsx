'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

type WeatherType = 'clear' | 'cloudy' | 'rain' | 'storm' | 'snow' | 'sunset' | 'aurora';

const weatherCycle: WeatherType[] = ['clear', 'cloudy', 'rain', 'storm', 'snow', 'sunset', 'aurora'];

export default function WeatherEffects() {
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % weatherCycle.length;
      setWeather(weatherCycle[idx]);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const getBackground = useCallback((w: WeatherType) => {
    switch (w) {
      case 'clear': return 'radial-gradient(ellipse at 80% 10%, rgba(251,191,36,0.08) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(245,158,11,0.03) 0%, transparent 50%), transparent';
      case 'cloudy': return 'linear-gradient(180deg, rgba(100,116,139,0.06) 0%, rgba(71,85,105,0.03) 50%, transparent 100%)';
      case 'rain': return 'linear-gradient(180deg, rgba(56,189,248,0.04) 0%, rgba(14,165,233,0.06) 100%)';
      case 'storm': return 'linear-gradient(180deg, rgba(139,92,246,0.05) 0%, rgba(59,130,246,0.06) 50%, rgba(30,64,175,0.04) 100%)';
      case 'snow': return 'linear-gradient(180deg, rgba(186,230,253,0.04) 0%, rgba(224,242,254,0.03) 100%)';
      case 'sunset': return 'radial-gradient(ellipse at 50% 100%, rgba(249,115,22,0.1) 0%, rgba(236,72,153,0.06) 40%, rgba(139,92,246,0.04) 70%, transparent 100%)';
      case 'aurora': return 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.04) 0%, rgba(139,92,246,0.04) 40%, rgba(59,130,246,0.03) 70%, transparent 100%)';
      default: return 'transparent';
    }
  }, []);

  const particles = useMemo(() => {
    const items: { key: string; el: React.ReactNode }[] = [];
    let pid = 0;

    switch (weather) {
      case 'clear':
        // Sun glow + rays + sparkles
        items.push({ key: 'sun-glow', el: <div className="sun-glow" style={{ top: '-150px', right: '5%', width: '500px', height: '500px' }} /> });
        for (let i = 0; i < 12; i++) {
          items.push({ key: `ray-${i}`, el: <div key={pid++} className="sun-ray" style={{ transform: `rotate(${i * 30}deg)`, animationDelay: `${i * 0.5}s` }} /> });
        }
        for (let i = 0; i < 15; i++) {
          const s = 2 + Math.random() * 4;
          items.push({ key: `spark-${i}`, el: <div key={pid++} className="sun-sparkle" style={{ width: `${s}px`, height: `${s}px`, top: `${10 + Math.random() * 40}%`, right: `${5 + Math.random() * 30}%`, background: 'radial-gradient(circle, rgba(251,191,36,0.6), transparent)', borderRadius: '50%', position: 'absolute', '--delay': `${Math.random() * 3}s` } as React.CSSProperties } /> });
        }
        break;

      case 'cloudy':
        for (let i = 0; i < 6; i++) {
          items.push({ key: `cloud-${i}`, el: <div key={pid++} className="weather-cloud" style={{ width: `${250 + Math.random() * 350}px`, height: `${80 + Math.random() * 120}px`, top: `${5 + Math.random() * 50}%`, '--cloud-duration': `${35 + Math.random() * 30}s`, '--cloud-delay': `${Math.random() * 20}s`, '--cloud-opacity': '0.07', background: 'radial-gradient(ellipse at 50% 60%, rgba(148,163,184,0.1), transparent 70%)' } as React.CSSProperties } /> });
        }
        // Light beams
        for (let i = 0; i < 3; i++) {
          items.push({ key: `beam-${i}`, el: <div key={pid++} style={{ position: 'absolute', top: 0, left: `${20 + i * 25}%`, width: '2px', height: '100%', background: 'linear-gradient(to bottom, rgba(148,163,184,0.03), transparent 80%)', filter: 'blur(10px)' }} /> });
        }
        break;

      case 'rain':
        for (let i = 0; i < 50; i++) {
          items.push({ key: `rain-${i}`, el: <div key={pid++} className="rain-drop" style={{ left: `${Math.random() * 100}%`, '--rain-duration': `${0.8 + Math.random() * 1.2}s`, '--rain-delay': `${Math.random() * 3}s`, height: `${12 + Math.random() * 18}px`, opacity: 0.15 + Math.random() * 0.25, background: 'linear-gradient(to bottom, transparent, rgba(56,189,248,0.35))' } as React.CSSProperties } /> });
        }
        items.push({ key: 'rain-overlay', el: <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(14,165,233,0.02) 0%, rgba(3,105,161,0.04) 100%)' }} /> });
        break;

      case 'storm':
        // Heavy rain
        for (let i = 0; i < 65; i++) {
          items.push({ key: `storm-rain-${i}`, el: <div key={pid++} className="rain-drop" style={{ left: `${Math.random() * 100}%`, '--rain-duration': `${0.5 + Math.random() * 1}s`, '--rain-delay': `${Math.random() * 2}s`, height: `${15 + Math.random() * 20}px`, opacity: 0.15 + Math.random() * 0.3, transform: 'rotate(25deg)', background: 'linear-gradient(to bottom, transparent, rgba(139,92,246,0.3))' } as React.CSSProperties } /> });
        }
        // Lightning flashes
        for (let i = 0; i < 3; i++) {
          items.push({ key: `lightning-${i}`, el: <div key={pid++} className="lightning-flash" style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.04)', '--delay': `${i * 2.5}s` } as React.CSSProperties } /> });
        }
        break;

      case 'snow':
        for (let i = 0; i < 40; i++) {
          items.push({ key: `snow-${i}`, el: <div key={pid++} className="snow-flake" style={{ '--snow-duration': `${6 + Math.random() * 10}s`, '--snow-delay': `${Math.random() * 8}s`, '--snow-drift': `${-50 + Math.random() * 100}px`, width: `${3 + Math.random() * 5}px`, height: `${3 + Math.random() * 5}px`, background: 'radial-gradient(circle, rgba(255,255,255,0.7), rgba(224,242,254,0.2))' } as React.CSSProperties } /> });
        }
        // Frost shimmer
        for (let i = 0; i < 4; i++) {
          items.push({ key: `frost-${i}`, el: <div key={pid++} className="frost-shimmer" style={{ position: 'absolute', top: `${i * 25}%`, left: 0, right: 0, height: '25%', background: 'linear-gradient(90deg, transparent, rgba(186,230,253,0.02), transparent)', '--delay': `${i * 1.5}s` } as React.CSSProperties } /> });
        }
        break;

      case 'sunset':
        // Warm gradient overlay
        items.push({ key: 'sunset-overlay', el: <div className="sunset-glow" style={{ position: 'absolute', bottom: 0, left: '10%', right: '10%', height: '60%', background: 'radial-gradient(ellipse at 50% 100%, rgba(249,115,22,0.08) 0%, rgba(236,72,153,0.04) 40%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }} /> });
        // Cloud silhouettes
        for (let i = 0; i < 4; i++) {
          items.push({ key: `sunset-cloud-${i}`, el: <div key={pid++} className="weather-cloud" style={{ width: `${200 + Math.random() * 300}px`, height: `${60 + Math.random() * 80}px`, top: `${15 + Math.random() * 35}%`, '--cloud-duration': `${40 + Math.random() * 30}s`, '--cloud-delay': `${Math.random() * 15}s`, '--cloud-opacity': '0.06', background: 'radial-gradient(ellipse at 50% 60%, rgba(251,146,60,0.12), transparent 70%)' } as React.CSSProperties } /> });
        }
        // Sparkles
        for (let i = 0; i < 10; i++) {
          items.push({ key: `sunset-spark-${i}`, el: <div key={pid++} className="sun-sparkle" style={{ width: `${2 + Math.random() * 3}px`, height: `${2 + Math.random() * 3}px`, bottom: `${10 + Math.random() * 30}%`, left: `${10 + Math.random() * 80}%`, background: 'radial-gradient(circle, rgba(251,146,60,0.5), transparent)', borderRadius: '50%', position: 'absolute', '--delay': `${Math.random() * 4}s` } as React.CSSProperties } /> });
        }
        break;

      case 'aurora':
        // Aurora bands
        const auroraColors = ['rgba(34,197,94,0.06)', 'rgba(139,92,246,0.05)', 'rgba(59,130,246,0.04)', 'rgba(34,197,94,0.05)', 'rgba(168,85,247,0.04)'];
        for (let i = 0; i < 5; i++) {
          items.push({ key: `aurora-${i}`, el: <div key={pid++} className="aurora-band" style={{ position: 'absolute', top: `${5 + i * 8}%`, left: '-10%', right: '-10%', height: `${80 + Math.random() * 60}px`, background: `linear-gradient(90deg, transparent, ${auroraColors[i]}, transparent)`, filter: 'blur(20px)', borderRadius: '50%', '--delay': `${i * 1.5}s` } as React.CSSProperties } /> });
        }
        // Stars
        for (let i = 0; i < 20; i++) {
          items.push({ key: `star-${i}`, el: <div key={pid++} className="star-twinkle" style={{ width: `${1 + Math.random() * 2}px`, height: `${1 + Math.random() * 2}px`, top: `${Math.random() * 60}%`, left: `${Math.random() * 100}%`, background: 'white', borderRadius: '50%', position: 'absolute', '--delay': `${Math.random() * 4}s` } as React.CSSProperties } /> });
        }
        break;
    }
    return items;
  }, [weather]);

  if (!mounted) return null;

  return (
    <div className="weather-container weather-layer" style={{ background: getBackground(weather) }}>
      {particles.map(p => <div key={p.key}>{p.el}</div>)}
    </div>
  );
}
