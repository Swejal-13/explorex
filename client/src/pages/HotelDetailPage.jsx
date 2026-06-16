import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { hotelService } from '../services/api';
import PageLoader from '../components/common/PageLoader';
import BookingModal from '../components/hotel/BookingModal';
import { FiStar, FiMapPin, FiWifi, FiPhone } from 'react-icons/fi';
import { formatCurrency } from '../utils/helpers';

export default function HotelDetailPage() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    hotelService.getOne(id).then(({ data }) => { setHotel(data.hotel); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading || !hotel) return <PageLoader />;

  const primaryImage = hotel.images?.find((i) => i.isPrimary)?.url || hotel.images?.[0]?.url;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {primaryImage && <img src={primaryImage} alt={hotel.name} className="w-full h-72 object-cover mb-6" />}
          <div className="mb-4">
            <p className="text-[10px] tracking-[3px] uppercase text-gold-DEFAULT mb-1">{hotel.category}</p>
            <h1 className="font-display text-4xl font-light text-ink dark:text-white">{hotel.name}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
              <span className="flex items-center gap-1"><FiMapPin size={13} />{hotel.address}</span>
              {hotel.rating > 0 && <span className="flex items-center gap-1 text-gold-DEFAULT"><FiStar size={12} className="fill-current" />{hotel.rating.toFixed(1)} ({hotel.reviewCount} reviews)</span>}
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-white/70 leading-relaxed mb-6">{hotel.description}</p>
          {hotel.amenities?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-display text-xl font-light text-ink dark:text-white mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">{hotel.amenities.map((a) => <span key={a} className="text-xs bg-paper-2 dark:bg-white/10 border border-paper-2 dark:border-white/10 px-3 py-1.5 text-gray-600 dark:text-white/70">{a}</span>)}</div>
            </div>
          )}
          {hotel.roomTypes?.length > 0 && (
            <div>
              <h3 className="font-display text-xl font-light text-ink dark:text-white mb-3">Room Types</h3>
              <div className="space-y-3">
                {hotel.roomTypes.map((r) => (
                  <div key={r.name} className="flex items-center justify-between border border-paper-2 dark:border-white/10 p-4">
                    <div>
                      <div className="font-medium text-ink dark:text-white text-sm">{r.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Max {r.maxGuests} guests</div>
                    </div>
                    <div className="font-display text-xl text-accent dark:text-gold-DEFAULT">{formatCurrency(r.price)}<span className="text-xs font-sans text-gray-400">/night</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="bg-ink border border-gold-DEFAULT/15 p-5 sticky top-20">
            <div className="font-display text-3xl text-white mb-1">{formatCurrency(hotel.pricePerNight?.min || hotel.roomTypes?.[0]?.price || 0)}</div>
            <div className="text-xs text-white/40 mb-5">per night · taxes extra</div>
            <button onClick={() => setBookingOpen(true)} className="w-full bg-gold-DEFAULT text-ink text-xs tracking-widest uppercase py-3.5 hover:bg-gold-dark transition-colors mb-3">Book Now</button>
            {hotel.contact?.phone && <div className="flex items-center gap-2 text-xs text-white/50 mt-3"><FiPhone size={12} />{hotel.contact.phone}</div>}
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-xs text-white/40">
              {hotel.policies?.checkIn && <div>Check-in: {hotel.policies.checkIn}</div>}
              {hotel.policies?.checkOut && <div>Check-out: {hotel.policies.checkOut}</div>}
            </div>
          </div>
        </div>
      </div>
      <BookingModal hotel={hotel} isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}
