import React from 'react';

export default function PageLoader({ fullPage = true }) {
  return (
    <div className={`flex items-center justify-center ${fullPage ? 'min-h-[60vh]' : 'py-12'}`}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-paper-2 border-t-gold rounded-full animate-spin" />
        <p className="text-xs tracking-widest uppercase text-gold/60">Loading</p>
      </div>
    </div>
  );
}
