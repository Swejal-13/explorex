import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDestinations } from '../redux/slices/destinationSlice';
import { fetchHotels } from '../redux/slices/hotelSlice';
import { fetchBlogs } from '../redux/slices/blogSlice';
import DestinationCard from '../components/destination/DestinationCard';
import HotelCard from '../components/hotel/HotelCard';
import BlogCard from '../components/blog/BlogCard';
import { SkeletonCard, SkeletonDestCard } from '../components/common/Skeleton';
import { FiArrowRight, FiSearch } from 'react-icons/fi';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STATS = [
  { num: '500+', label: 'Destinations' },
  { num: '12K+', label: 'Happy Travellers' },
  { num: '98%',  label: 'Satisfaction' },
  { num: '4.9★', label: 'Avg Rating' },
];

const FEATURES = [
  { emoji: '🤖', title: 'AI Trip Planner', desc: 'Get personalised day-by-day itineraries crafted by AI in seconds.' },
  { emoji: '🗺️', title: 'Curated Destinations', desc: '500+ handpicked destinations with insider guides and local tips.' },
  { emoji: '🏨', title: 'Seamless Booking', desc: 'Book hotels and packages with secure Razorpay payment integration.' },
  { emoji: '✍️', title: 'Travel Community', desc: 'Share stories, read blogs, and connect with fellow wanderers.' },
];

export default function HomePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

const destinationsState = useSelector((s) => s.destinations);
const hotelsState = useSelector((s) => s.hotels);
const blogsState = useSelector((s) => s.blogs);

const destinations =
  Array.isArray(destinationsState?.items)
    ? destinationsState.items
    : Array.isArray(destinationsState?.data)
    ? destinationsState.data
    : Array.isArray(destinationsState)
    ? destinationsState
    : [];
const hotels = hotelsState?.items || [];
const blogs = blogsState?.items || [];

const destLoading = destinationsState?.isLoading;
const hotelLoading = hotelsState?.isLoading;
const blogLoading = blogsState?.isLoading;

  useEffect(() => {
    dispatch(fetchDestinations({ trending: true, limit: 6 }));
    dispatch(fetchHotels({ limit: 3 }));
    dispatch(fetchBlogs({ featured: true, limit: 3 }));
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/destinations?search=${encodeURIComponent(searchQuery)}`);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
  };

  return (
    <div>
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="min-h-[88vh] bg-gradient-to-br from-ink via-[#2A1F1A] to-[#1A2B3F] flex flex-col items-center justify-center text-center px-4 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(201,168,76,0.06),transparent)] pointer-events-none" />
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-[10px] tracking-[4px] uppercase text-gold-DEFAULT mb-5 opacity-90"
        >
          ✦ AI-Powered Travel Planning ✦
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
          className="font-display text-5xl md:text-7xl font-light text-white leading-[1.05] max-w-3xl mb-5"
        >
          Where Will Your<br />
          <em className="text-gold-DEFAULT font-light italic">Next Story</em> Begin?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-sm text-white/50 max-w-md leading-relaxed mb-10"
        >
          Discover breathtaking destinations, craft AI-powered itineraries, and book experiences that last a lifetime.
        </motion.p>
        <motion.form
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          onSubmit={handleSearch}
          className="flex w-full max-w-xl bg-white/5 border border-gold-DEFAULT/25 backdrop-blur-sm"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destinations, hotels, experiences…"
            className="flex-1 bg-transparent border-none outline-none px-5 py-4 text-white text-sm placeholder-white/30"
          />
          <button type="submit" className="bg-gold-DEFAULT text-ink px-6 py-4 text-xs tracking-widest uppercase hover:bg-gold-dark transition-colors flex items-center gap-2 font-medium">
            <FiSearch size={14} /> Search
          </button>
        </motion.form>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="flex gap-10 mt-14 pt-8 border-t border-white/8"
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <span className="block font-display text-3xl text-gold-DEFAULT">{s.num}</span>
              <span className="text-[10px] tracking-[2px] uppercase text-white/35">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── TRENDING DESTINATIONS ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-10 pb-5 border-b border-paper-2 dark:border-white/10">
          <div>
            <p className="text-[10px] tracking-[3px] uppercase text-gold-DEFAULT mb-1">Explore the World</p>
            <h2 className="font-display text-4xl font-light text-ink dark:text-white">
              Trending <em className="italic text-accent dark:text-gold-light">Destinations</em>
            </h2>
          </div>
          <Link to="/destinations" className="text-[10px] tracking-widest uppercase text-gold-DEFAULT border-b border-gold-DEFAULT/30 pb-0.5 hover:border-gold-DEFAULT transition-colors flex items-center gap-1">
            View All <FiArrowRight size={11} />
          </Link>
        </div>
        {destLoading ? (
          <div className="grid grid-cols-3 gap-px">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonDestCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-px">
            {(destinations || []).slice(0, 5).map((dest, i) => (
              <div key={dest._id} className={i === 0 ? 'row-span-2' : ''}>
                <DestinationCard destination={dest} large={i === 0} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section className="bg-ink py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-[10px] tracking-[3px] uppercase text-gold-DEFAULT mb-2">Why ExploreX</p>
            <h2 className="font-display text-4xl font-light text-white">
              Travel <em className="italic text-gold-DEFAULT">Smarter</em>, Not Harder
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="border border-white/8 p-6 hover:border-gold-DEFAULT/30 transition-colors"
              >
                <div className="text-3xl mb-4">{f.emoji}</div>
                <h3 className="font-display text-lg text-white mb-2">{f.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED HOTELS ───────────────────────────────────── */}
      <section className="bg-paper-2 dark:bg-white/3 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10 pb-5 border-b border-paper-2 dark:border-white/10">
            <div>
              <p className="text-[10px] tracking-[3px] uppercase text-gold-DEFAULT mb-1">Handpicked Stays</p>
              <h2 className="font-display text-4xl font-light text-ink dark:text-white">
                Featured <em className="italic text-accent dark:text-gold-light">Hotels</em>
              </h2>
            </div>
            <Link to="/hotels" className="text-[10px] tracking-widest uppercase text-gold-DEFAULT border-b border-gold-DEFAULT/30 pb-0.5 hover:border-gold-DEFAULT transition-colors flex items-center gap-1">
              View All <FiArrowRight size={11} />
            </Link>
          </div>
          {hotelLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hotels.slice(0, 3).map((hotel) => <HotelCard key={hotel._id} hotel={hotel} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── AI PLANNER CTA ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-ink border border-gold-DEFAULT/15 p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[10px] tracking-[3px] uppercase text-gold-DEFAULT mb-2">Powered by AI</p>
            <h2 className="font-display text-3xl font-light text-white mb-3">
              Get Your Perfect <em className="italic text-gold-DEFAULT">Itinerary</em> in Seconds
            </h2>
            <p className="text-sm text-white/40 max-w-lg leading-relaxed">
              Tell our AI your destination, budget, and interests — and watch it craft a personalised day-by-day travel plan just for you.
            </p>
          </div>
          <Link
            to="/plan"
            className="bg-gold-DEFAULT text-ink text-xs tracking-widest uppercase px-8 py-4 hover:bg-gold-dark transition-colors whitespace-nowrap flex items-center gap-2 font-medium"
          >
            Try AI Planner <FiArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* ── TRAVEL BLOG ──────────────────────────────────────── */}
      <section className="bg-paper-2 dark:bg-white/3 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10 pb-5 border-b border-paper-2 dark:border-white/10">
            <div>
              <p className="text-[10px] tracking-[3px] uppercase text-gold-DEFAULT mb-1">Community Stories</p>
              <h2 className="font-display text-4xl font-light text-ink dark:text-white">
                From the <em className="italic text-accent dark:text-gold-light">Blog</em>
              </h2>
            </div>
            <Link to="/blog" className="text-[10px] tracking-widest uppercase text-gold-DEFAULT border-b border-gold-DEFAULT/30 pb-0.5 hover:border-gold-DEFAULT transition-colors flex items-center gap-1">
              All Posts <FiArrowRight size={11} />
            </Link>
          </div>
          {blogLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-[3px] uppercase text-gold-DEFAULT mb-2">Traveller Stories</p>
          <h2 className="font-display text-4xl font-light text-ink dark:text-white">
            What Our <em className="italic text-accent dark:text-gold-light">Community</em> Says
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { text: 'The AI itinerary for my Rajasthan trip was absolutely spot-on. Every suggestion felt personal, like a local friend planned it for me.', name: 'Priya Sharma', role: 'Mumbai · Leisure Traveller' },
            { text: 'Booked our Maldives honeymoon package in minutes. The seamless experience and stunning recommendations made it unforgettable.', name: 'Arjun & Neha Kapoor', role: 'Delhi · Honeymooners' },
            { text: 'As a solo traveller, having an AI that understands my budget and interests was a game changer. Ladakh exceeded every expectation.', name: 'Rohan Mehta', role: 'Bangalore · Solo Adventurer' },
          ].map((t) => (
            <div key={t.name} className="bg-white dark:bg-white/5 border border-paper-2 dark:border-white/10 p-6">
              <div className="font-display text-5xl text-gold-light leading-none mb-3">"</div>
              <p className="text-sm text-ink dark:text-white/80 leading-relaxed italic mb-4">{t.text}</p>
              <p className="text-sm font-medium text-ink dark:text-white">{t.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
