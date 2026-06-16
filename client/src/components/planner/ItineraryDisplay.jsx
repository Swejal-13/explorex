import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiDollarSign, FiInfo, FiSun } from 'react-icons/fi';

export default function ItineraryDisplay({ plan }) {
  if (!plan) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div>
        <h3 className="font-display text-2xl font-light text-ink dark:text-white">{plan.title}</h3>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{plan.summary}</p>
      </div>
      <div className="space-y-4">
        {(plan.days || []).map((day) => (
          <div key={day.day} className="border-l-2 border-gold-light pl-4">
            <div className="text-[9px] tracking-[2.5px] uppercase text-gold-DEFAULT mb-1 flex items-center gap-1"><FiCalendar size={9} /> Day {day.day}{day.title ? ` — ${day.title}` : ''}</div>
            <p className="text-sm text-ink dark:text-white leading-relaxed">{day.activities}</p>
            {day.places?.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{day.places.map((p) => <span key={p} className="text-[10px] bg-paper dark:bg-white/10 border border-paper-2 dark:border-white/10 px-2 py-0.5 text-gray-500">📍 {p}</span>)}</div>}
          </div>
        ))}
      </div>
      {plan.budgetBreakdown && <div className="bg-accent-light dark:bg-accent/20 border border-accent/20 p-3"><div className="flex items-center gap-2 text-accent text-xs font-medium mb-1"><FiDollarSign size={12} /> Budget Breakdown</div><p className="text-xs text-accent/80 leading-relaxed">{plan.budgetBreakdown}</p></div>}
      {plan.travelTips && <div className="bg-gold-DEFAULT/5 border border-gold-DEFAULT/20 p-3"><div className="flex items-center gap-2 text-gold-dark text-xs font-medium mb-1"><FiInfo size={12} /> Travel Tips</div><p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{plan.travelTips}</p></div>}
      {plan.bestTimeToVisit && <div className="flex items-center gap-2 text-xs text-gray-500"><FiSun size={12} className="text-gold-DEFAULT" /><span><strong>Best time:</strong> {plan.bestTimeToVisit}</span></div>}
    </motion.div>
  );
}
