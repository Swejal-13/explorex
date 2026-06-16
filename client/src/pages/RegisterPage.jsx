import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const { register, isLoading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => { if (isAuthenticated) navigate('/'); }, [isAuthenticated]);
  useEffect(() => { if (error) { toast.error(error); clearError(); } }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(form);
    toast.success('Welcome to ExploreX! 🎉');
  };

  const inputCls = 'w-full border border-paper-2 dark:border-white/10 bg-paper dark:bg-white/5 px-4 py-3 text-sm outline-none text-ink dark:text-white placeholder-gray-400 focus:border-gold-DEFAULT transition-colors';
  const labelCls = 'block text-[10px] tracking-widest uppercase text-gray-500 dark:text-white/40 mb-1.5';

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-paper-2 dark:bg-ink/50">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white dark:bg-gray-900 border border-paper-2 dark:border-white/10">
        <div className="bg-ink px-8 py-6 text-center">
          <Link to="/" className="font-display text-2xl tracking-widest text-gold-DEFAULT">Explore<span className="text-white">X</span></Link>
          <p className="text-xs text-white/35 mt-1">Start your adventure</p>
        </div>
        <div className="p-8">
          <h2 className="font-display text-2xl font-light text-ink dark:text-white mb-6">Create Account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className={labelCls}>Full Name</label><input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Your full name" required className={inputCls} /></div>
            <div><label className={labelCls}>Email Address</label><input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="you@example.com" required className={inputCls} /></div>
            <div><label className={labelCls}>Password</label><input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} placeholder="At least 6 characters" required minLength={6} className={inputCls} /></div>
            <button type="submit" disabled={isLoading} className="w-full bg-gold-DEFAULT text-ink text-xs tracking-widest uppercase py-3.5 hover:bg-gold-dark transition-colors disabled:opacity-50 font-medium">
              {isLoading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-5">
            Already have an account? <Link to="/login" className="text-gold-DEFAULT hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
