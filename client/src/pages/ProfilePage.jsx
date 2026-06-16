import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/api';
import { setUser } from '../redux/slices/authSlice';
import { getInitials } from '../utils/helpers';

const INTERESTS = ['Beaches','Nightlife','Food','Trekking','Culture','Adventure','Shopping','Photography','Wildlife','Wellness'];

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [selectedInterests, setSelectedInterests] = useState(user?.preferences?.interests || []);
  const [loading, setLoading] = useState(false);

  const toggleInterest = (i) => setSelectedInterests((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await authService.updateProfile({ ...form, preferences: { ...user.preferences, interests: selectedInterests } });
      dispatch(setUser(data.user));
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const inputCls = 'w-full border border-paper-2 dark:border-white/10 bg-paper dark:bg-white/5 px-4 py-3 text-sm outline-none text-ink dark:text-white placeholder-gray-400 focus:border-gold-DEFAULT transition-colors';
  const labelCls = 'block text-[10px] tracking-widest uppercase text-gray-500 mb-1.5';

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="mb-8">
        <p className="text-[10px] tracking-[3px] uppercase text-gold-DEFAULT mb-2">Account</p>
        <h1 className="font-display text-4xl font-light text-ink dark:text-white">My <em className="italic text-accent dark:text-gold-light">Profile</em></h1>
      </div>
      <div className="bg-white dark:bg-white/5 border border-paper-2 dark:border-white/10 p-8">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-paper-2 dark:border-white/10">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gold-DEFAULT/20 border-2 border-gold-DEFAULT/40 flex items-center justify-center text-gold-DEFAULT font-display text-2xl">
            {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(user?.name)}
          </div>
          <div>
            <div className="font-display text-xl text-ink dark:text-white">{user?.name}</div>
            <div className="text-xs text-gray-400">{user?.email}</div>
            <div className="text-[9px] tracking-widest uppercase text-gold-DEFAULT mt-0.5">{user?.role}</div>
          </div>
        </div>
        <div className="space-y-5">
          <div><label className={labelCls}>Full Name</label><input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className={inputCls} /></div>
          <div><label className={labelCls}>Bio</label><textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} rows={3} placeholder="Tell us about your travel style…" className={`${inputCls} resize-none`} /></div>
          <div>
            <label className={labelCls}>Travel Interests</label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <button key={i} onClick={() => toggleInterest(i)} className={`text-xs px-3 py-1.5 border transition-all ${selectedInterests.includes(i) ? 'bg-gold-DEFAULT text-ink border-gold-DEFAULT' : 'border-paper-2 dark:border-white/10 text-gray-600 dark:text-white/60 hover:border-gold-DEFAULT/50'}`}>{i}</button>
              ))}
            </div>
          </div>
          <button onClick={handleSave} disabled={loading} className="bg-gold-DEFAULT text-ink text-xs tracking-widest uppercase px-8 py-3 hover:bg-gold-dark transition-colors disabled:opacity-50">{loading ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
}
