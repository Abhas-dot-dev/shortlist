'use client';

import React from 'react';

interface SkillBadgeProps {
  name: string;
  type?: 'required' | 'preferred' | 'matching' | 'missing' | 'default';
  className?: string;
}

export function SkillBadge({ name, type = 'default', className = '' }: SkillBadgeProps) {
  let styles = 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';

  if (type === 'required') {
    styles = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60';
  } else if (type === 'preferred') {
    styles = 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/60';
  } else if (type === 'matching') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60';
  } else if (type === 'missing') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border transition-all duration-200 hover:scale-105 ${styles} ${className}`}
    >
      {name}
    </span>
  );
}
