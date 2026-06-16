import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import PageLoader from '../../components/common/PageLoader';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    adminService.getAllBookings({ status: statusFilter }).then(({ data }) => { setBookings(data.bookings); setLoading(false); });
  }, [statusFilter]);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] tracking-[3px] uppercase text-gold-DEFAULT mb-1">Admin Panel</p>
          <h1 className="font-display text-3xl font-light text-ink dark:text-white">All Bookings</h1>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-paper-2 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm outline-none text-ink dark:text-white focus:border-gold-DEFAULT transition-colors">
          <option value="">All Statuses</option>
          {['pending','confirmed','cancelled','completed'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="bg-white dark:bg-white/5 border border-paper-2 dark:border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper dark:bg-white/5 border-b border-paper-2 dark:border-white/10">
            <tr>{['Hotel','Guest','Dates','Status','Total'].map((h) => <th key={h} className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-gray-400">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-paper-2 dark:divide-white/5">
            {bookings.map((b) => (
              <tr key={b._id} className="hover:bg-paper dark:hover:bg-white/3 transition-colors">
                <td className="px-4 py-3 text-ink dark:text-white">{b.hotel?.name}</td>
                <td className="px-4 py-3 text-gray-500">{b.user?.name}<br/><span className="text-xs">{b.user?.email}</span></td>
                <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</td>
                <td className="px-4 py-3"><span className={`text-[9px] tracking-widest uppercase px-2 py-0.5 ${b.status === 'confirmed' ? 'bg-green-50 text-green-700' : b.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>{b.status}</span></td>
                <td className="px-4 py-3 text-accent dark:text-gold-DEFAULT font-display text-base">{formatCurrency(b.totalAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
