import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDestination } from '../redux/slices/destinationSlice';
import PageLoader from '../components/common/PageLoader';
import { FiStar, FiMapPin, FiHeart } from 'react-icons/fi';
import { useWishlist } from '../hooks/useWishlist';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/helpers';

export default function DestinationDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: dest, isLoading } = useSelector((s) => s.destinations);
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggle } = useWishlist();

  useEffect(() => { dispatch(fetchDestination(id)); }, [id]);

  if (isLoading || !dest) return <PageLoader />;

  const primaryImage = dest.images?.find((i) => i.isPrimary)?.url || dest.images?.[0]?.url;
  const wishlisted = isWishlisted(dest._id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {primaryImage && <img src={primaryImage} alt={dest.name} className="w-full h-80 object-cover mb-6" />}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] tracking-[3px] uppercase text-gold-DEFAULT mb-1">{dest.country} · {dest.type}</p>
              <h1 className="font-display text-4xl font-light text-ink dark:text-white">{dest.name}</h1>
            </div>
            <div className="flex items-center gap-3">
              {dest.rating > 0 && <div className="flex items-center gap-1 text-sm text-gold-DEFAULT"><FiStar className="fill-current" size={14} /> {dest.rating.toFixed(1)}</div>}
              <button onClick={() => { if (!isAuthenticated) { toast.error('Sign in first'); return; } toggle(dest._id); toast.success(wishlisted ? 'Removed' : 'Saved!'); }}
                className={`w-9 h-9 flex items-center justify-center border transition-all ${wishlisted ? 'bg-gold-DEFAULT border-gold-DEFAULT text-ink' : 'border-paper-2 text-gray-400 hover:border-gold-DEFAULT hover:text-gold-DEFAULT'}`}>
                <FiHeart size={15} className={wishlisted ? 'fill-current' : ''} />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-white/70 leading-relaxed mb-6">{dest.description}</p>
          {dest.highlights?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-display text-xl font-light text-ink dark:text-white mb-3">Highlights</h3>
              <ul className="space-y-2">{dest.highlights.map((h) => <li key={h} className="flex items-start gap-2 text-sm text-gray-600 dark:text-white/70"><span className="text-gold-DEFAULT mt-0.5">✦</span>{h}</li>)}</ul>
            </div>
          )}
          {dest.bestTimeToVisit?.length > 0 && (
            <div>
              <h3 className="font-display text-xl font-light text-ink dark:text-white mb-2">Best Time to Visit</h3>
              <div className="flex gap-2 flex-wrap">{dest.bestTimeToVisit.map((t) => <span key={t} className="text-xs bg-paper-2 dark:bg-white/10 border border-paper-2 dark:border-white/10 px-3 py-1 text-gray-600 dark:text-white/70">{t}</span>)}</div>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div className="bg-ink border border-gold-DEFAULT/15 p-5">
            <h3 className="font-display text-lg font-light text-white mb-4">Plan This Trip</h3>
            <Link to={`/plan?destination=${encodeURIComponent(dest.name)}`} className="block w-full bg-gold-DEFAULT text-ink text-center text-xs tracking-widest uppercase py-3 hover:bg-gold-dark transition-colors mb-3">AI Trip Planner</Link>
            <Link to={`/hotels?destination=${dest._id}`} className="block w-full border border-white/20 text-white text-center text-xs tracking-widest uppercase py-3 hover:border-gold-DEFAULT transition-colors">Browse Hotels</Link>
          </div>
          {dest.avgBudgetPerDay && (
            <div className="bg-white dark:bg-white/5 border border-paper-2 dark:border-white/10 p-5">
              <h3 className="font-display text-lg font-light text-ink dark:text-white mb-3">Avg Budget / Day</h3>
              {[['Budget', dest.avgBudgetPerDay.budget],['Mid-Range',dest.avgBudgetPerDay.midRange],['Luxury',dest.avgBudgetPerDay.luxury]].filter(([,v])=>v).map(([l,v]) => (
                <div key={l} className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">{l}</span>
                  <span className="text-ink dark:text-white font-medium">{formatCurrency(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
