'use client';

import React from 'react';

interface ScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showText?: boolean;
}

export function ScoreCircle({
  score,
  size = 60,
  strokeWidth = 5,
  showText = true
}: ScoreCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference;

  // Determine colors based on score
  let strokeColor = 'stroke-red-500';
  let bgColor = 'bg-red-50 dark:bg-red-950/20';
  let textColor = 'text-red-600 dark:text-red-400';

  if (score >= 80) {
    strokeColor = 'stroke-emerald-500';
    bgColor = 'bg-emerald-50 dark:bg-emerald-950/20';
    textColor = 'text-emerald-600 dark:text-emerald-400';
  } else if (score >= 60) {
    strokeColor = 'stroke-blue-500';
    bgColor = 'bg-blue-50 dark:bg-blue-950/20';
    textColor = 'text-blue-600 dark:text-blue-400';
  } else if (score >= 40) {
    strokeColor = 'stroke-amber-500';
    bgColor = 'bg-amber-50 dark:bg-amber-950/20';
    textColor = 'text-amber-600 dark:text-amber-400';
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          className="stroke-slate-200 dark:stroke-slate-800"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Foreground circle */}
        <circle
          className={`transition-all duration-1000 ease-out ${strokeColor}`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {showText && (
        <span className={`absolute text-xs font-bold ${textColor}`}>
          {score}%
        </span>
      )}
    </div>
  );
}
