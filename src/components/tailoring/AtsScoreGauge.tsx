'use client';

import { useEffect, useState } from 'react';

interface AtsScoreGaugeProps {
  score: number;
}

function getScoreColor(score: number) {
  if (score <= 40) return { stroke: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'Needs Work' };
  if (score <= 70) return { stroke: '#eab308', bg: 'rgba(234,179,8,0.1)', label: 'Good' };
  return { stroke: '#22c55e', bg: 'rgba(34,197,94,0.1)', label: 'Excellent' };
}

export default function AtsScoreGauge({ score }: AtsScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const clampedScore = Math.max(0, Math.min(100, score));
  const { stroke, bg, label } = getScoreColor(clampedScore);

  // Animate score count-up
  useEffect(() => {
    const duration = 1000;
    const start = performance.now();
    let raf: number;

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * clampedScore));
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [clampedScore]);

  // SVG arc calculation (semi-circle gauge)
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // semi-circle
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm font-medium text-muted-foreground">ATS Match Score</p>

      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg
          width={size}
          height={size / 2 + strokeWidth}
          viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
          className="overflow-visible"
        >
          {/* Background arc */}
          <path
            d={describeArc(size / 2, size / 2 + strokeWidth / 2, radius, 180, 360)}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="text-muted/40"
          />
          {/* Filled arc */}
          <path
            d={describeArc(size / 2, size / 2 + strokeWidth / 2, radius, 180, 360)}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="gauge-fill"
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>

        {/* Score number */}
        <div
          className="absolute inset-x-0 flex flex-col items-center"
          style={{ bottom: 0 }}
        >
          <span
            className="text-4xl font-bold tabular-nums"
            style={{ color: stroke }}
          >
            {animatedScore}
          </span>
          <span
            className="text-xs font-medium rounded-full px-2.5 py-0.5 mt-0.5"
            style={{ backgroundColor: bg, color: stroke }}
          >
            {label}
          </span>
        </div>
      </div>

      {/* Progress bar fallback */}
      <div className="w-full max-w-[220px] h-2 rounded-full bg-muted/40 overflow-hidden mt-1">
        <div
          className="h-full rounded-full gauge-fill"
          style={{
            width: `${animatedScore}%`,
            backgroundColor: stroke,
            transition: 'width 0.05s linear',
          }}
        />
      </div>
    </div>
  );
}

// Helper: SVG arc path
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}
