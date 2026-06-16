import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="font-display text-8xl text-gold-light dark:text-gold-dark mb-4">404</div>
        <h1 className="font-display text-3xl font-light text-ink dark:text-white mb-3">Page Not Found</h1>
        <p className="text-sm text-gray-400 mb-8">The destination you're looking for seems to have wandered off.</p>
        <Link to="/" className="bg-gold-DEFAULT text-ink text-xs tracking-widest uppercase px-8 py-3 hover:bg-gold-dark transition-colors">Back to Home</Link>
      </motion.div>
    </div>
  );
}
