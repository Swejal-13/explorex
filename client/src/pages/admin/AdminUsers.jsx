import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import PageLoader from '../../components/common/PageLoader';
import toast from 'react-hot-toast';
import { FiSearch } from 'react-icons/fi';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try { const { data } = await adminService.getUsers({ search }); setUsers(data.users); setTotal(data.total); }
    catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(); }, [search]);

  const toggleRole = async (id, currentRole) => {
    try {
      await adminService.updateUser(id, { role: currentRole === 'admin' ? 'user' : 'admin' });
      toast.success('Role updated'); loadUsers();
    } catch { toast.error('Failed to update'); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] tracking-[3px] uppercase text-gold-DEFAULT mb-1">Admin Panel</p>
          <h1 className="font-display text-3xl font-light text-ink dark:text-white">Users <span className="text-gray-400 text-xl">({total})</span></h1>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className="border border-paper-2 dark:border-white/10 bg-white dark:bg-white/5 pl-9 pr-4 py-2 text-sm outline-none text-ink dark:text-white focus:border-gold-DEFAULT transition-colors" />
        </div>
      </div>
      <div className="bg-white dark:bg-white/5 border border-paper-2 dark:border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper dark:bg-white/5 border-b border-paper-2 dark:border-white/10">
            <tr>{['Name','Email','Role','Joined','Actions'].map((h) => <th key={h} className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-gray-400">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-paper-2 dark:divide-white/5">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-paper dark:hover:bg-white/3 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gold-DEFAULT/20 flex items-center justify-center text-xs text-gold-DEFAULT overflow-hidden">
                      {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : u.name[0]}
                    </div>
                    <span className="text-ink dark:text-white">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3"><span className={`text-[9px] tracking-widest uppercase px-2 py-0.5 border ${u.role === 'admin' ? 'bg-gold-DEFAULT/10 text-gold-dark border-gold-DEFAULT/30' : 'bg-gray-50 dark:bg-white/5 text-gray-500 border-paper-2 dark:border-white/10'}`}>{u.role}</span></td>
                <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleRole(u._id, u.role)} className="text-xs text-gold-DEFAULT hover:underline">{u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
