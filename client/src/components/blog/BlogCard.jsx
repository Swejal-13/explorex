import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiMessageSquare, FiClock } from 'react-icons/fi';
import { truncate } from '../../utils/helpers';

export default function BlogCard({ blog }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="group cursor-pointer">
      <Link to={`/blog/${blog.slug}`}>
        <div className="relative overflow-hidden h-44 bg-paper-2 dark:bg-white/10 mb-3">
          {blog.coverImage?.url ? <img src={blog.coverImage.url} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" /> : <div className="w-full h-full bg-gradient-to-br from-accent/20 to-gold-light/20 flex items-center justify-center text-4xl">✍️</div>}
          {blog.isFeatured && <div className="absolute top-2 left-2 bg-gold text-ink text-[9px] tracking-widest uppercase px-2 py-1">Featured</div>}
        </div>
        <div className="flex gap-2 flex-wrap mb-2">{blog.tags?.slice(0, 3).map((tag) => <span key={tag} className="text-[9px] tracking-widest uppercase text-gold-dark dark:text-gold bg-gold/10 px-2 py-0.5">{tag}</span>)}</div>
        <h3 className="font-display text-xl font-light text-ink dark:text-white leading-snug mb-2 group-hover:text-accent dark:group-hover:text-gold transition-colors">{blog.title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-3">{truncate(blog.excerpt || '', 110)}</p>
        <div className="flex items-center gap-4 text-[10px] text-gray-400">
          <span>✍ {blog.author?.name}</span>
          <span className="flex items-center gap-1"><FiClock size={10} /> {blog.readTime || 3}min</span>
          <span className="flex items-center gap-1"><FiHeart size={10} /> {blog.likeCount || 0}</span>
          <span className="flex items-center gap-1"><FiMessageSquare size={10} /> {blog.commentCount || 0}</span>
        </div>
      </Link>
    </motion.div>
  );
}
