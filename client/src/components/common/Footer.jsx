import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiMail } from 'react-icons/fi';

const cols = [
  { title: 'Explore', links: [
    { label: 'Destinations', to: '/destinations' },
    { label: 'Hotels & Stays', to: '/hotels' },
    { label: 'AI Trip Planner', to: '/plan' },
    { label: 'Travel Blog', to: '/blog' },
  ]},
  { title: 'Company', links: [
    { label: 'About Us', to: '/' },
    { label: 'Careers', to: '/' },
    { label: 'Press Kit', to: '/' },
    { label: 'Partners', to: '/' },
  ]},
  { title: 'Support', links: [
    { label: 'Help Centre', to: '/' },
    { label: 'Privacy Policy', to: '/' },
    { label: 'Terms of Service', to: '/' },
    { label: 'Cookie Policy', to: '/' },
  ]},
];

export default function Footer() {
  return (
    <footer className="bg-ink border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="font-display text-2xl tracking-widest text-gold">
              Explore<span className="text-white">X</span>
            </Link>
            <p className="mt-3 text-xs text-white/35 leading-relaxed max-w-xs">
              AI-powered travel planning that turns your dream trips into unforgettable journeys.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[FiInstagram, FiTwitter, FiFacebook, FiYoutube].map((Icon, i) => (
                <a key={i} href="#" className="text-white/30 hover:text-gold transition-colors">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {cols.map((col) => (
            <div key={col.title}>
              <p className="text-[10px] tracking-[3px] uppercase text-gold mb-4">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-xs text-white/40 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-white/5 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xs tracking-widest uppercase text-gold mb-1">Stay Inspired</p>
            <p className="text-xs text-white/40">Weekly travel stories and exclusive deals, right to your inbox.</p>
          </div>
          <form className="flex gap-0 w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="your@email.com"
              className="bg-white/5 border border-white/10 text-white text-xs px-4 py-2.5 outline-none w-full md:w-64 placeholder-white/25 focus:border-gold/50 transition-colors"
            />
            <button
              type="submit"
              className="bg-gold text-ink text-xs px-5 py-2.5 tracking-widest uppercase hover:bg-gold-dark transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <FiMail size={12} /> Subscribe
            </button>
          </form>
        </div>

        <div className="border-t border-white/5 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-white/25">© {new Date().getFullYear()} ExploreX. All rights reserved.</p>
          <p className="text-xs text-white/25">Made with ♥ for wanderers</p>
        </div>
      </div>
    </footer>
  );
}
