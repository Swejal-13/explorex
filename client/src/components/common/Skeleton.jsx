import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-white/5 border border-paper-2 dark:border-white/10 overflow-hidden animate-pulse">
      <div className="h-44 bg-paper-2 dark:bg-white/10" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-paper-2 dark:bg-white/10 rounded w-1/3" />
        <div className="h-5 bg-paper-2 dark:bg-white/10 rounded w-2/3" />
        <div className="h-3 bg-paper-2 dark:bg-white/10 rounded w-1/2" />
        <div className="h-px bg-paper-2 dark:bg-white/10 mt-3" />
        <div className="flex justify-between pt-1">
          <div className="h-5 bg-paper-2 dark:bg-white/10 rounded w-20" />
          <div className="h-7 bg-paper-2 dark:bg-white/10 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonDestCard() {
  return (
    <div className="bg-paper-2 dark:bg-white/5 aspect-[3/4] animate-pulse" />
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-paper-2 dark:bg-white/10 rounded" style={{ width: i === lines - 1 ? '60%' : '100%' }} />
      ))}
    </div>
  );
}
