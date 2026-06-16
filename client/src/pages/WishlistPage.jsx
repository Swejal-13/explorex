import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiMapPin } from 'react-icons/fi';
import { fetchWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.wishlist);

  useEffect(() => { dispatch(fetchWishlist()); }, [dispatch]);

  const handleRemove = (id) => { dispatch(removeFromWishlist(id)); toast.success('Removed from wishlist'); };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="mb-8">
        <p className="text-[10px] tracking-[3px] uppercase text-gold-DEFAULT mb-2">Your Collection</p>
        <h1 className="font-display text-4xl font-light text-ink dark:text-white">My <em className="italic text-accent dark:text-gold-light">Wishlist</em></h1>
        <p className="text-sm text-gray-400 mt-2">{items.length} saved destination{items.length !== 1 ? 's' : ''}</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4 opacity-20">🗺️</div>
          <p className="text-gray-400 mb-6">Your wishlist is empty. Start exploring and save your favourites!</p>
          <Link to="/destinations" className="bg-gold-DEFAULT text-ink text-xs tracking-widest uppercase px-6 py-3 hover:bg-gold-dark transition-colors">Explore Destinations</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((dest) => {
            const img = dest.images?.find((i) => i.isPrimary)?.url || dest.images?.[0]?.url;
            return (
              <motion.div key={dest._id} layout className="flex gap-4 bg-white dark:bg-white/5 border border-paper-2 dark:border-white/10 p-4 hover:shadow-md transition-shadow">
                <Link to={`/destinations/${dest.slug || dest._id}`} className="flex-shrink-0 w-20 h-20 overflow-hidden bg-paper-2">
                  {img ? <img src={img} alt={dest.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🗺️</div>}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/destinations/${dest.slug || dest._id}`}>
                    <h3 className="font-display text-xl font-light text-ink dark:text-white hover:text-accent transition-colors">{dest.name}</h3>
                  </Link>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5"><FiMapPin size={11} />{dest.country} · {dest.type}</div>
                  {dest.rating > 0 && <div className="text-xs text-gold-DEFAULT mt-1">★ {dest.rating.toFixed(1)}</div>}
                </div>
                <button onClick={() => handleRemove(dest._id)} className="text-gray-300 hover:text-red-400 transition-colors self-start p-1"><FiTrash2 size={15} /></button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
