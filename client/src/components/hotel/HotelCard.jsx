import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiStar } from 'react-icons/fi';
import { formatCurrency } from '../../utils/helpers';
import BookingModal from './BookingModal';

export default function HotelCard({ hotel }) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const primaryImage = hotel.images?.find((i) => i.isPrimary)?.url || hotel.images?.[0]?.url;
  return (
    <>
      <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-white/5 border border-paper-2 dark:border-white/10 overflow-hidden group">
        <Link to={`/hotels/${hotel._id}`}>
          <div className="relative h-44 overflow-hidden bg-paper-2 dark:bg-white/10">
            {primaryImage ? <img src={primaryImage} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🏨</div>}
            {hotel.isFeatured && <div className="absolute top-2 left-2 bg-gold-DEFAULT text-ink text-[9px] tracking-widest uppercase px-2 py-1">Featured</div>}
          </div>
          <div className="p-4">
            <div className="text-[9px] tracking-[2px] uppercase text-gold-DEFAULT mb-1">{hotel.category}</div>
            <h3 className="font-display text-xl font-light text-ink dark:text-white leading-tight mb-1">{hotel.name}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500"><FiMapPin size={11} /><span>{hotel.destination?.name || 'India'}</span></div>
          </div>
        </Link>
        <div className="px-4 pb-4 flex items-center justify-between border-t border-paper-2 dark:border-white/10 pt-3">
          <div>
            <div className="flex items-center gap-0.5 text-gold-DEFAULT text-xs mb-1">{Array.from({ length: hotel.starRating || 5 }).map((_, i) => <FiStar key={i} size={10} className="fill-current" />)}</div>
            <div className="font-display text-xl text-accent dark:text-gold-light">{formatCurrency(hotel.pricePerNight?.min || hotel.roomTypes?.[0]?.price || 0)}<span className="text-xs font-sans text-gray-400 ml-1">/ night</span></div>
          </div>
          <button onClick={() => setBookingOpen(true)} className="bg-ink dark:bg-gold-DEFAULT text-white dark:text-ink text-[10px] tracking-widest uppercase px-4 py-2 hover:bg-gold-DEFAULT hover:text-ink dark:hover:bg-gold-dark transition-all">Book Now</button>
        </div>
      </motion.div>
      <BookingModal hotel={hotel} isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
