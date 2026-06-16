import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlog } from '../redux/slices/blogSlice';
import { blogService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/helpers';
import PageLoader from '../components/common/PageLoader';
import toast from 'react-hot-toast';
import { FiHeart, FiMessageSquare, FiClock } from 'react-icons/fi';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { current: blog, isLoading } = useSelector((s) => s.blogs);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    dispatch(fetchBlog(slug));
    blogService.getComments(slug).then(({ data }) => setComments(data.comments)).catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (blog) { setLikeCount(blog.likeCount || 0); setLiked(blog.likes?.includes(user?._id)); }
  }, [blog]);

  const handleLike = async () => {
    if (!user) { toast.error('Sign in to like'); return; }
    try {
      const { data } = await blogService.toggleLike(blog._id);
      setLiked(data.liked); setLikeCount(data.likeCount);
    } catch { toast.error('Failed'); }
  };

  const handleComment = async () => {
    if (!user) { toast.error('Sign in to comment'); return; }
    if (!commentText.trim()) return;
    try {
      const { data } = await blogService.addComment(blog._id, { text: commentText });
      setComments((p) => [data.comment, ...p]); setCommentText('');
      toast.success('Comment added!');
    } catch { toast.error('Failed'); }
  };

  if (isLoading || !blog) return <PageLoader />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="flex gap-2 mb-4">{blog.tags?.map((t) => <span key={t} className="text-[9px] tracking-widest uppercase text-gold-dark bg-gold-DEFAULT/10 px-2 py-0.5">{t}</span>)}</div>
      <h1 className="font-display text-4xl md:text-5xl font-light text-ink dark:text-white leading-tight mb-4">{blog.title}</h1>
      <div className="flex items-center gap-4 text-xs text-gray-400 mb-8 pb-6 border-b border-paper-2 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gold-DEFAULT/20 flex items-center justify-center text-xs overflow-hidden">
            {blog.author?.avatar ? <img src={blog.author.avatar} alt="" className="w-full h-full object-cover" /> : blog.author?.name?.[0]}
          </div>
          <span>{blog.author?.name}</span>
        </div>
        <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
        <span className="flex items-center gap-1"><FiClock size={10} /> {blog.readTime || 3} min read</span>
      </div>
      {blog.coverImage?.url && <img src={blog.coverImage.url} alt={blog.title} className="w-full h-72 object-cover mb-8" />}
      <div className="prose prose-sm max-w-none text-ink dark:text-white/80 leading-relaxed whitespace-pre-wrap mb-8">{blog.content?.replace(/<[^>]*>/g, '')}</div>

      {/* Likes */}
      <div className="flex items-center gap-4 py-5 border-y border-paper-2 dark:border-white/10 mb-8">
        <button onClick={handleLike} className={`flex items-center gap-2 text-sm transition-colors ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
          <FiHeart size={16} className={liked ? 'fill-current' : ''} /> {likeCount} likes
        </button>
        <span className="flex items-center gap-2 text-sm text-gray-400"><FiMessageSquare size={16} /> {comments.length} comments</span>
      </div>

      {/* Comments */}
      <div>
        <h3 className="font-display text-xl font-light text-ink dark:text-white mb-4">Comments</h3>
        {user && (
          <div className="flex gap-3 mb-6">
            <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleComment()} placeholder="Share your thoughts…" className="flex-1 border border-paper-2 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-sm outline-none text-ink dark:text-white placeholder-gray-400 focus:border-gold-DEFAULT transition-colors" />
            <button onClick={handleComment} className="bg-gold-DEFAULT text-ink text-xs tracking-widest uppercase px-5 hover:bg-gold-dark transition-colors">Post</button>
          </div>
        )}
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c._id} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gold-DEFAULT/20 flex items-center justify-center text-xs flex-shrink-0 overflow-hidden">
                {c.author?.avatar ? <img src={c.author.avatar} alt="" className="w-full h-full object-cover" /> : c.author?.name?.[0]}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-ink dark:text-white">{c.author?.name}</span>
                  <span className="text-[10px] text-gray-400">{formatDate(c.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-white/70">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
