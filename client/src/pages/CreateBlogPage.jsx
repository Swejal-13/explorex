import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { blogService } from '../services/api';

const CATEGORIES = ['Travel Guide','Adventure','Food & Culture','Budget Travel','Luxury','Solo Travel','Family','Photography'];

export default function CreateBlogPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', destination: '', tags: '', category: 'Travel Guide', status: 'published' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) { toast.error('Title and content are required'); return; }
    setLoading(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
      const { data } = await blogService.create(payload);
      toast.success('Blog published! 🎉');
      navigate(`/blog/${data.blog.slug}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to publish'); }
    finally { setLoading(false); }
  };

  const inputCls = 'w-full border border-paper-2 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm outline-none text-ink dark:text-white placeholder-gray-400 focus:border-gold-DEFAULT transition-colors';
  const labelCls = 'block text-[10px] tracking-widest uppercase text-gray-500 mb-1.5';

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-8">
        <p className="text-[10px] tracking-[3px] uppercase text-gold-DEFAULT mb-2">Community</p>
        <h1 className="font-display text-4xl font-light text-ink dark:text-white">Write a <em className="italic text-accent dark:text-gold-light">Blog Post</em></h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div><label className={labelCls}>Title *</label><input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="An unforgettable journey to…" required className={inputCls} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Category</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Destination</label><input type="text" value={form.destination} onChange={(e) => set('destination', e.target.value)} placeholder="e.g. Goa, Ladakh…" className={inputCls} /></div>
        </div>
        <div><label className={labelCls}>Tags (comma-separated)</label><input type="text" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="beaches, budget travel, food…" className={inputCls} /></div>
        <div><label className={labelCls}>Excerpt / Summary</label><textarea value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} rows={2} placeholder="Brief description of your post…" className={`${inputCls} resize-none`} /></div>
        <div><label className={labelCls}>Content *</label><textarea value={form.content} onChange={(e) => set('content', e.target.value)} rows={14} placeholder="Write your travel story here…" required className={`${inputCls} resize-y`} /></div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-gold-DEFAULT text-ink text-xs tracking-widest uppercase px-8 py-3 hover:bg-gold-dark transition-colors disabled:opacity-50">{loading ? 'Publishing…' : 'Publish Post'}</button>
          <button type="button" onClick={() => navigate('/blog')} className="border border-paper-2 dark:border-white/10 text-ink dark:text-white text-xs tracking-widest uppercase px-6 py-3 hover:border-gold-DEFAULT transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  );
}
