import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHotels } from '../redux/slices/hotelSlice';
import HotelCard from '../components/hotel/HotelCard';
import { SkeletonCard } from '../components/common/Skeleton';

const CATEGORIES = ['Budget','Standard','Deluxe','Luxury','Heritage','Resort','Boutique'];

export default function HotelsPage() {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((s) => s.hotels);
  const [filters, setFilters] = useState({ category: '', sort: '-rating' });

  useEffect(() => { dispatch(fetchHotels({ ...filters, limit: 12 })); }, [filters, dispatch]);
  const set = (k, v) => setFilters((p) => ({ ...p, [k]: v }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="mb-8">
        <p className="text-[10px] tracking-[3px] uppercase text-gold-DEFAULT mb-2">Handpicked Stays</p>
        <h1 className="font-display text-4xl font-light text-ink dark:text-white">Hotels & <em className="italic text-accent dark:text-gold-light">Packages</em></h1>
      </div>
      <div className="flex flex-wrap gap-3 mb-8">
        <select value={filters.category} onChange={(e) => set('category', e.target.value)} className="border border-paper-2 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm outline-none text-ink dark:text-white focus:border-gold-DEFAULT transition-colors">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.sort} onChange={(e) => set('sort', e.target.value)} className="border border-paper-2 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm outline-none text-ink dark:text-white focus:border-gold-DEFAULT transition-colors">
          <option value="-rating">Top Rated</option>
          <option value="pricePerNight.min">Price: Low to High</option>
          <option value="-pricePerNight.min">Price: High to Low</option>
        </select>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{items.map((h) => <HotelCard key={h._id} hotel={h} />)}</div>
      )}
    </div>
  );
}
