import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiStar } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useWishlist } from '../../hooks/useWishlist';
import toast from 'react-hot-toast';

export default function DestinationCard({ destination, large = false }) {
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(destination._id);
  const primaryImage = destination.images?.find((i) => i.isPrimary)?.url || destination.images?.[0]?.url;

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Sign in to save destinations'); return; }
    toggle(destination._id);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
  };

  return (
    <Link to={`/destinations/${destination.slug || destination._id}`}>
      <motion.div whileHover={{ scale: 1.01 }} className={`group relative overflow-hidden cursor-pointer ${large ? 'aspect-[2/3]' : 'aspect-[3/4]'} bg-paper-2`}>
        {primaryImage ? (
          <img src={primaryImage} alt={destination.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent to-accent-light flex items-center justify-center text-5xl">🗺️</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <div className="text-[9px] tracking-[2px] uppercase text-gold-light mb-1">{destination.country}</div>
          <h3 className="font-display text-2xl font-light text-white leading-tight">{destination.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-gold-DEFAULT/20 border border-gold-DEFAULT/30 text-gold-light text-[9px] tracking-widest uppercase px-2 py-0.5">{destination.type}</span>
            {destination.rating > 0 && (
              <span className="flex items-center gap-1 text-xs text-gold-light"><FiStar size={10} className="fill-current" /> {destination.rating.toFixed(1)}</span>
            )}
          </div>
        </div>
        <button onClick={handleWishlist} className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center backdrop-blur-sm border transition-all ${wishlisted ? 'bg-gold-DEFAULT border-gold-DEFAULT text-ink' : 'bg-ink/50 border-white/20 text-white hover:bg-gold-DEFAULT hover:border-gold-DEFAULT hover:text-ink'}`}>
          <FiHeart size={13} className={wishlisted ? 'fill-current' : ''} />
        </button>
        {destination.isTrending && (
          <div className="absolute top-3 left-3 bg-gold-DEFAULT text-ink text-[9px] tracking-widest uppercase px-2 py-1">Trending</div>
        )}
      </motion.div>
    </Link>
  );
}
