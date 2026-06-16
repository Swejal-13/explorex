import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchDestinations } from '../redux/slices/destinationSlice';
import DestinationCard from '../components/destination/DestinationCard';
import DestinationFilter from '../components/destination/DestinationFilter';
import { SkeletonDestCard } from '../components/common/Skeleton';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

export default function DestinationsPage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { items, total, pages, isLoading } = useSelector((s) => s.destinations);
  const [filters, setFilters] = useState({ search: searchParams.get('search') || '', type: '', sort: '-rating', page: 1 });

  useEffect(() => { dispatch(fetchDestinations({ ...filters, limit: 12 })); }, [filters, dispatch]);

  const hasMore = filters.page < pages;
  const loadMore = () => setFilters((p) => ({ ...p, page: p.page + 1 }));
  const lastRef = useInfiniteScroll(isLoading, hasMore, loadMore);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="mb-8">
        <p className="text-[10px] tracking-[3px] uppercase text-gold-DEFAULT mb-2">Explore the World</p>
        <h1 className="font-display text-4xl font-light text-ink dark:text-white">All <em className="italic text-accent dark:text-gold-light">Destinations</em></h1>
        <p className="text-sm text-gray-400 mt-2">{total} destinations found</p>
      </div>
      <DestinationFilter filters={filters} onChange={setFilters} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px">
        {items.map((dest, i) => (
          <div key={dest._id} ref={i === items.length - 1 ? lastRef : null}>
            <DestinationCard destination={dest} />
          </div>
        ))}
        {isLoading && Array.from({ length: 4 }).map((_, i) => <SkeletonDestCard key={i} />)}
      </div>
      {!isLoading && items.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🔍</div>
          <p>No destinations found. Try different filters.</p>
        </div>
      )}
    </div>
  );
}
