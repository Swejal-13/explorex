import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchBlogs } from '../redux/slices/blogSlice';
import BlogCard from '../components/blog/BlogCard';
import { SkeletonCard } from '../components/common/Skeleton';
import { FiEdit3 } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const CATEGORIES = ['Travel Guide','Adventure','Food & Culture','Budget Travel','Luxury','Solo Travel','Family','Photography'];

export default function BlogsPage() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { items, isLoading, total } = useSelector((s) => s.blogs);
  const [filters, setFilters] = useState({ category: '', search: '' });

  useEffect(() => { dispatch(fetchBlogs(filters)); }, [filters, dispatch]);
  const set = (k, v) => setFilters((p) => ({ ...p, [k]: v }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[10px] tracking-[3px] uppercase text-gold-DEFAULT mb-2">Community Stories</p>
          <h1 className="font-display text-4xl font-light text-ink dark:text-white">Travel <em className="italic text-accent dark:text-gold-light">Blog</em></h1>
        </div>
        {isAuthenticated && (
          <Link to="/blog/create" className="bg-gold-DEFAULT text-ink text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-gold-dark transition-colors flex items-center gap-2">
            <FiEdit3 size={13} /> Write a Blog
          </Link>
        )}
      </div>
      <div className="flex flex-wrap gap-3 mb-8">
        <input type="text" value={filters.search} onChange={(e) => set('search', e.target.value)} placeholder="Search blogs…" className="border border-paper-2 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm outline-none text-ink dark:text-white placeholder-gray-400 focus:border-gold-DEFAULT transition-colors w-64" />
        <select value={filters.category} onChange={(e) => set('category', e.target.value)} className="border border-paper-2 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm outline-none text-ink dark:text-white focus:border-gold-DEFAULT transition-colors">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{items.map((b) => <BlogCard key={b._id} blog={b} />)}</div>
      )}
      {!isLoading && items.length === 0 && (
        <div className="text-center py-20 text-gray-400"><div className="text-5xl mb-4">📝</div><p>No blogs found.</p></div>
      )}
    </div>
  );
}
