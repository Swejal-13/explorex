import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { fetchMyBookings } from '../redux/slices/bookingSlice';
import { formatCurrency, formatDate } from '../utils/helpers';
import { FiCalendar, FiMapPin, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import PageLoader from '../components/common/PageLoader';

const STATUS_STYLES = {
  confirmed:  { cls: 'bg-green-50 text-green-700 border-green-200', icon: FiCheckCircle },
  pending:    { cls: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: FiClock },
  cancelled:  { cls: 'bg-red-50 text-red-700 border-red-200', icon: FiXCircle },
  completed:  { cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: FiCheckCircle },
};

export default function BookingsPage() {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((s) => s.bookings);

  useEffect(() => { dispatch(fetchMyBookings()); }, [dispatch]);

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="mb-8">
        <p className="text-[10px] tracking-[3px] uppercase text-gold-DEFAULT mb-2">Your Travel History</p>
        <h1 className="font-display text-4xl font-light text-ink dark:text-white">My <em className="italic text-accent dark:text-gold-light">Bookings</em></h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4 opacity-20">🏨</div>
          <p className="text-gray-400">No bookings yet. Time to plan your first trip!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((booking) => {
            const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
            const StatusIcon = statusStyle.icon;
            const hotelImg = booking.hotel?.images?.find((i) => i.isPrimary)?.url || booking.hotel?.images?.[0]?.url;
            return (
              <motion.div key={booking._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 bg-white dark:bg-white/5 border border-paper-2 dark:border-white/10 p-5">
                <div className="w-14 h-14 flex-shrink-0 bg-accent-light dark:bg-accent/20 flex items-center justify-center text-2xl overflow-hidden">
                  {hotelImg ? <img src={hotelImg} alt="" className="w-full h-full object-cover" /> : '🏨'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-xl font-light text-ink dark:text-white">{booking.hotel?.name || 'Hotel'}</div>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><FiMapPin size={11} />{booking.hotel?.destination?.name || 'India'}</span>
                    <span className="flex items-center gap-1"><FiCalendar size={11} />{formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}</span>
                    <span>{booking.nights} night{booking.nights > 1 ? 's' : ''} · {booking.guests} guest{booking.guests > 1 ? 's' : ''}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Ref: {booking.confirmationCode}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={`flex items-center gap-1.5 text-[10px] tracking-widest uppercase px-2 py-1 border ${statusStyle.cls}`}>
                    <StatusIcon size={10} /> {booking.status}
                  </div>
                  <div className="font-display text-xl text-accent dark:text-gold-DEFAULT">{formatCurrency(booking.totalAmount)}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
