import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { aiService } from '../services/api';
import ItineraryDisplay from '../components/planner/ItineraryDisplay';
import PageLoader from '../components/common/PageLoader';

const INTERESTS = ['Beaches','Nightlife','Food','Trekking','Culture','Adventure','Shopping','Photography','Wildlife','Wellness','Temples','Backpacking'];

export default function PlannerPage() {
  const [form, setForm] = useState({ destination: '', budget: '', days: '3' });
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleInterest = (i) => setSelectedInterests((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);

  const handleGenerate = async () => {
    if (!form.destination.trim()) { toast.error('Please enter a destination'); return; }
    setLoading(true);
    setPlan(null);
    try {
      const { data } = await aiService.generateItinerary({ destination: form.destination, budget: form.budget, days: parseInt(form.days), interests: selectedInterests });
      setPlan(data.plan);
      toast.success('Itinerary generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate itinerary');
    } finally { setLoading(false); }
  };

  const inputCls = 'w-full bg-white/5 border border-white/10 outline-none px-4 py-3 text-white text-sm placeholder-white/30 focus:border-gold-DEFAULT/50 transition-colors';
  const labelCls = 'block text-[9px] tracking-[2px] uppercase text-white/40 mb-1.5';

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="mb-10">
        <p className="text-[10px] tracking-[3px] uppercase text-gold-DEFAULT mb-2">Powered by Claude AI</p>
        <h1 className="font-display text-4xl font-light text-ink dark:text-white">Your Personal <em className="italic text-accent dark:text-gold-light">Trip Planner</em></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Form */}
        <div className="bg-ink border border-gold-DEFAULT/15 p-8">
          <h3 className="font-display text-2xl font-light text-white mb-1">Plan Your Dream Trip</h3>
          <p className="text-xs text-white/35 mb-6 leading-relaxed">Enter your preferences and our AI will craft a personalised day-by-day itinerary.</p>

          <div className="space-y-5">
            <div>
              <label className={labelCls}>Destination</label>
              <input type="text" value={form.destination} onChange={(e) => set('destination', e.target.value)} placeholder="e.g. Goa, Bali, Rajasthan, Paris…" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Budget (₹)</label>
                <input type="number" value={form.budget} onChange={(e) => set('budget', e.target.value)} placeholder="e.g. 20000" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Number of Days</label>
                <select value={form.days} onChange={(e) => set('days', e.target.value)} className={`${inputCls} cursor-pointer`}>
                  {['2','3','4','5','7','10','14'].map((d) => <option key={d} value={d} className="bg-ink">{d} Days</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Interests (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <button key={interest} onClick={() => toggleInterest(interest)}
                    className={`text-xs px-3 py-1.5 border transition-all ${selectedInterests.includes(interest) ? 'bg-gold-DEFAULT text-ink border-gold-DEFAULT' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'}`}>
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading}
            className="w-full mt-6 bg-gold-DEFAULT text-ink text-xs tracking-widest uppercase py-4 hover:bg-gold-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium">
            {loading ? <><div className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" /> Crafting your itinerary…</> : '✦ Generate Itinerary'}
          </button>
        </div>

        {/* Result */}
        <div className="bg-white dark:bg-white/5 border border-paper-2 dark:border-white/10 p-8 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-8 h-8 border-2 border-paper-2 border-t-gold-DEFAULT rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Crafting your personalised itinerary…</p>
            </div>
          ) : plan ? (
            <ItineraryDisplay plan={plan} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-5xl mb-4 opacity-20">🗺️</div>
              <p className="text-sm text-gray-400 leading-relaxed">Fill in your travel preferences<br />and let AI craft your perfect journey.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
