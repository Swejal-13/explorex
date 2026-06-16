import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import { bookingService } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

export default function BookingModal({ hotel, isOpen, onClose }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ roomType: hotel?.roomTypes?.[0]?.name || '', checkIn: '', checkOut: '', guests: 2, specialRequests: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const nights = form.checkIn && form.checkOut ? Math.max(0, Math.ceil((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000)) : 0;
  const selectedRoom = hotel?.roomTypes?.find((r) => r.name === form.roomType);
  const pricePerNight = selectedRoom?.price || hotel?.pricePerNight?.min || 0;
  const subtotal = nights * pricePerNight;
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + taxes;
  const inputCls = 'w-full border border-paper-2 dark:border-white/10 bg-paper dark:bg-white/5 px-3 py-2.5 text-sm outline-none text-ink dark:text-white focus:border-gold-DEFAULT transition-colors';
  const labelCls = 'block text-[10px] tracking-widest uppercase text-gray-500 mb-1.5';

  const handleSubmit = async () => {
    if (!isAuthenticated) { toast.error('Please sign in to book'); navigate('/login'); return; }
    if (!form.checkIn || !form.checkOut || nights < 1) { toast.error('Please select valid dates'); return; }
    setLoading(true);
    try {
      const { data } = await bookingService.create({ hotelId: hotel._id, ...form });
      toast.success('Booking created! 🎉'); onClose(); navigate('/bookings');
    } catch (err) { toast.error(err.response?.data?.message || 'Booking failed'); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Book — ${hotel?.name}`} size="md">
      <div className="space-y-4">
        {hotel?.roomTypes?.length > 0 && (
          <div><label className={labelCls}>Room Type</label>
            <select value={form.roomType} onChange={(e) => set('roomType', e.target.value)} className={inputCls}>
              {hotel.roomTypes.filter((r) => r.available).map((r) => <option key={r.name} value={r.name}>{r.name} — {formatCurrency(r.price)}/night</option>)}
            </select>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Check-In</label><input type="date" value={form.checkIn} min={new Date().toISOString().split('T')[0]} onChange={(e) => set('checkIn', e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Check-Out</label><input type="date" value={form.checkOut} min={form.checkIn} onChange={(e) => set('checkOut', e.target.value)} className={inputCls} /></div>
        </div>
        <div><label className={labelCls}>Guests</label><input type="number" value={form.guests} min={1} max={10} onChange={(e) => set('guests', +e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Special Requests</label><input type="text" value={form.specialRequests} onChange={(e) => set('specialRequests', e.target.value)} placeholder="Any special needs?" className={inputCls} /></div>
        {nights > 0 && (
          <div className="bg-paper dark:bg-white/5 border border-paper-2 dark:border-white/10 p-3 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500"><span>{nights} night{nights > 1 ? 's' : ''} × {formatCurrency(pricePerNight)}</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-xs text-gray-500"><span>GST & fees</span><span>{formatCurrency(taxes)}</span></div>
            <div className="flex justify-between font-medium text-sm pt-1.5 border-t border-paper-2 dark:border-white/10"><span>Total</span><span className="text-accent dark:text-gold-DEFAULT">{formatCurrency(total)}</span></div>
          </div>
        )}
        <button onClick={handleSubmit} disabled={loading} className="w-full bg-gold-DEFAULT text-ink text-xs tracking-widest uppercase py-3.5 hover:bg-gold-dark transition-colors disabled:opacity-50">{loading ? 'Processing…' : 'Confirm & Pay'}</button>
      </div>
    </Modal>
  );
}
