import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import PageLoader from '../../components/common/PageLoader';
import { FiUsers, FiCalendar, FiDollarSign, FiMapPin, FiBarChart2, FiSettings } from 'react-icons/fi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats().then(({ data }) => { setStats(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const cards = stats ? [
    { icon: FiUsers,     label: 'Total Users',    value: stats.stats.users.total,    sub: `+${stats.stats.users.thisMonth} this month`,    color: 'text-blue-500'  },
    { icon: FiCalendar,  label: 'Total Bookings', value: stats.stats.bookings.total,  sub: `+${stats.stats.bookings.thisMonth} this month`,  color: 'text-green-500' },
    { icon: FiDollarSign,label: 'Total Revenue',  value: formatCurrency(stats.stats.revenue.total), sub: formatCurrency(stats.stats.revenue.thisMonth) + ' this month', color: 'text-gold-DEFAULT' },
    { icon: FiMapPin,    label: 'Destinations',   value: stats.stats.destinations,   sub: `${stats.stats.hotels} hotels`,                   color: 'text-purple-500'},
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] tracking-[3px] uppercase text-gold-DEFAULT mb-1">Admin Panel</p>
          <h1 className="font-display text-3xl font-light text-ink dark:text-white">Dashboard</h1>
        </div>
        <div className="flex gap-3">
          {[{to:'/admin/users',label:'Users',Icon:FiUsers},{to:'/admin/bookings',label:'Bookings',Icon:FiCalendar}].map(({to,label,Icon}) => (
            <Link key={to} to={to} className="flex items-center gap-2 text-xs border border-paper-2 dark:border-white/10 px-4 py-2 text-ink dark:text-white hover:border-gold-DEFAULT transition-colors">
              <Icon size={13} />{label}
            </Link>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="bg-white dark:bg-white/5 border border-paper-2 dark:border-white/10 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] tracking-widest uppercase text-gray-400">{c.label}</span>
              <c.icon size={16} className={c.color} />
            </div>
            <div className="font-display text-3xl font-light text-ink dark:text-white">{c.value}</div>
            <div className="text-xs text-gray-400 mt-1">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white dark:bg-white/5 border border-paper-2 dark:border-white/10 p-5">
          <h3 className="font-display text-xl font-light text-ink dark:text-white mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {(stats?.recentBookings || []).map((b) => (
              <div key={b._id} className="flex items-center justify-between text-sm border-b border-paper-2 dark:border-white/5 pb-2 last:border-0 last:pb-0">
                <div>
                  <div className="text-ink dark:text-white font-medium">{b.hotel?.name}</div>
                  <div className="text-xs text-gray-400">{b.user?.name}</div>
                </div>
                <div className="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200">{b.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Destinations */}
        <div className="bg-white dark:bg-white/5 border border-paper-2 dark:border-white/10 p-5">
          <h3 className="font-display text-xl font-light text-ink dark:text-white mb-4">Top Destinations</h3>
          <div className="space-y-3">
            {(stats?.topDestinations || []).map((d, i) => (
              <div key={d._id} className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400 w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="text-sm text-ink dark:text-white">{d.name}</div>
                  <div className="text-xs text-gray-400">{d.country}</div>
                </div>
                <div className="text-xs text-gray-400">{d.viewCount} views</div>
                <div className="text-xs text-gold-DEFAULT">★ {d.rating?.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
