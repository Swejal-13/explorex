import React from 'react';
const TYPES = ['Beach', 'Mountain', 'Cultural', 'Adventure', 'Luxury', 'Wildlife', 'City', 'Spiritual'];
export default function DestinationFilter({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value, page: 1 });
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <input type="text" value={filters.search || ''} onChange={(e) => set('search', e.target.value)} placeholder="Search destinations…" className="border border-paper-2 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm outline-none w-64 text-ink dark:text-white placeholder-gray-400 focus:border-gold transition-colors" />
      <select value={filters.type || ''} onChange={(e) => set('type', e.target.value)} className="border border-paper-2 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm outline-none text-ink dark:text-white focus:border-gold transition-colors">
        <option value="">All Types</option>
        {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </select>
      <select value={filters.sort || '-rating'} onChange={(e) => set('sort', e.target.value)} className="border border-paper-2 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm outline-none text-ink dark:text-white focus:border-gold transition-colors">
        <option value="-rating">Top Rated</option>
        <option value="-viewCount">Most Popular</option>
        <option value="name">A–Z</option>
      </select>
      {(filters.search || filters.type) && (
        <button onClick={() => onChange({ sort: '-rating', page: 1 })} className="text-xs text-gold border border-gold/30 px-4 py-2.5 hover:bg-gold hover:text-ink transition-all">Clear</button>
      )}
    </div>
  );
}
