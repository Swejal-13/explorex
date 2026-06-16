import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiHeart, FiBell, FiUser, FiLogOut, FiSun, FiMoon,
  FiMenu, FiX, FiSettings, FiBookOpen, FiCalendar, FiGrid,
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useSelector } from 'react-redux';
import { toggleDarkMode } from '../../redux/slices/uiSlice';
import { markAllRead } from '../../redux/slices/notificationSlice';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { darkMode } = useSelector((s) => s.ui);
  const { unreadCount, items: notifications } = useSelector((s) => s.notifications);

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/destinations?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleNotifOpen = () => {
    setNotifOpen((p) => !p);
    if (!notifOpen && unreadCount > 0) {
      api.put('/notifications/read-all').catch(() => {});
      dispatch(markAllRead());
    }
  };

  const navLinks = [
    { to: '/destinations', label: 'Destinations' },
    { to: '/hotels',       label: 'Hotels' },
    { to: '/plan',         label: 'AI Planner' },
    { to: '/blog',         label: 'Blog' },
  ];

  return (
    <>
      <nav className="bg-ink sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="font-display text-xl tracking-widest text-gold">
            Explore<span className="text-white">X</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `text-xs tracking-widest uppercase transition-colors ${
                    isActive ? 'text-gold' : 'text-white/60 hover:text-gold'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-white/60 hover:text-gold transition-colors"
              aria-label="Search"
            >
              <FiSearch size={16} />
            </button>

            {/* Dark mode */}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className="p-2 text-white/60 hover:text-gold transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Wishlist */}
                <Link to="/wishlist" className="p-2 text-white/60 hover:text-gold transition-colors">
                  <FiHeart size={16} />
                </Link>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={handleNotifOpen}
                    className="p-2 text-white/60 hover:text-gold transition-colors relative"
                  >
                    <FiBell size={16} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-gold rounded-full" />
                    )}
                  </button>
                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 border border-paper-2 dark:border-white/10 shadow-xl z-50"
                      >
                        <div className="p-3 border-b border-paper-2 dark:border-white/10">
                          <p className="text-xs tracking-widest uppercase text-gold">Notifications</p>
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <p className="p-4 text-xs text-gray-400 text-center">No notifications</p>
                          ) : (
                            notifications.slice(0, 8).map((n) => (
                              <div
                                key={n._id}
                                className={`p-3 border-b border-paper-2 dark:border-white/5 text-xs cursor-pointer hover:bg-paper dark:hover:bg-white/5 ${!n.isRead ? 'bg-gold-light/20' : ''}`}
                                onClick={() => { setNotifOpen(false); if (n.link) navigate(n.link); }}
                              >
                                <p className="font-medium text-ink dark:text-white">{n.title}</p>
                                <p className="text-gray-500 mt-0.5">{n.message}</p>
                                <p className="text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((p) => !p)}
                    className="flex items-center gap-2 ml-1"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-gold/40" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold text-xs font-medium">
                        {user?.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </button>
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-ink border border-white/10 shadow-xl z-50"
                      >
                        <div className="p-3 border-b border-white/10">
                          <p className="text-sm text-white font-medium truncate">{user?.name}</p>
                          <p className="text-xs text-white/40 truncate">{user?.email}</p>
                        </div>
                        {[
                          { to: '/profile',  icon: FiUser,     label: 'My Profile' },
                          { to: '/bookings', icon: FiCalendar, label: 'My Bookings' },
                          { to: '/wishlist', icon: FiHeart,    label: 'Wishlist' },
                          { to: '/blog/create', icon: FiBookOpen, label: 'Write Blog' },
                          ...(isAdmin ? [{ to: '/admin', icon: FiGrid, label: 'Admin Dashboard' }] : []),
                        ].map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-xs text-white/60 hover:text-gold hover:bg-white/5 transition-colors"
                          >
                            <item.icon size={13} />
                            {item.label}
                          </Link>
                        ))}
                        <div className="border-t border-white/10">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-white/60 hover:text-red-400 hover:bg-white/5 transition-colors"
                          >
                            <FiLogOut size={13} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2 ml-2">
                <Link
                  to="/login"
                  className="text-xs text-gold/80 hover:text-gold border border-gold/30 hover:border-gold px-3 py-1.5 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs bg-gold text-ink px-3 py-1.5 hover:bg-gold-dark transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="md:hidden p-2 text-white/60 hover:text-white ml-1"
            >
              {menuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-ink border-t border-white/5 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `block py-2 text-xs tracking-widest uppercase ${isActive ? 'text-gold' : 'text-white/60'}`
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
                {!isAuthenticated && (
                  <div className="flex gap-2 pt-2">
                    <Link to="/login"    onClick={() => setMenuOpen(false)} className="flex-1 text-center text-xs border border-gold/30 text-gold py-2">Sign In</Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center text-xs bg-gold text-ink py-2">Get Started</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/90 z-[200] flex items-start justify-center pt-24 px-4"
            onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
          >
            <motion.form
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              onSubmit={handleSearch}
              className="w-full max-w-2xl flex"
            >
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations, hotels, experiences…"
                className="flex-1 bg-transparent border-b-2 border-gold/50 focus:border-gold outline-none text-white text-xl py-3 pr-4 placeholder-white/30"
              />
              <button type="submit" className="text-gold pl-4 text-xl">
                <FiSearch />
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for dropdowns */}
      {(profileOpen || notifOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setProfileOpen(false); setNotifOpen(false); }}
        />
      )}
    </>
  );
}
