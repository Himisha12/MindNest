import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import CommentSection from '../components/CommentSection';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { adaptContent, calculateReadingTime } from '../utils/readingAdaptor';
import { Heart, Eye, Clock, Edit3, Trash2, ArrowLeft, Share2, Check, Zap, Coffee, BookOpen, Armchair } from 'lucide-react';

const PostDetailPage = () => {
  const { slugOrId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [copiedTooltip, setCopiedTooltip] = useState(false);

  // Adaptive Reading Experience States
  const [readingMode, setReadingMode] = useState('10min'); // '2min' | '5min' | '10min' | '20min'
  const [scrollPercent, setScrollPercent] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Custom Modal & Toast States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Scroll Progress Listener
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentScroll = window.scrollY;
        const progress = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
        setScrollPercent(progress);
        setIsScrolled(currentScroll > 250);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/posts/${slugOrId}`);
        setPost(data);
        setLikesCount(data.likes ? data.likes.length : 0);
        if (user && data.likes) {
          setIsLiked(data.likes.some((id) => id === user._id || id._id === user._id));
        }
      } catch (err) {
        setError(err.message || 'Post not found');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slugOrId, authLoading]);

  const handleToggleLike = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      setLiking(true);
      const { data } = await api.post(`/posts/${post._id}/like`);
      setIsLiked(data.liked);
      setLikesCount(data.likesCount);

      if (data.liked) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      }
    } catch (err) {
      console.error('Like toggle failed:', err);
    } finally {
      setLiking(false);
    }
  };

  const confirmDeletePost = async () => {
    try {
      await api.delete(`/posts/${post._id}`);
      navigate('/dashboard');
    } catch (err) {
      setToastMessage(err.message || 'Failed to delete post');
      setToastOpen(true);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedTooltip(true);
    setTimeout(() => {
      setCopiedTooltip(false);
    }, 2500);
  };

  if (loading) {
    return (
      <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading article details...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', margin: '3rem 0' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#ef4444' }}>
          Article Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Feed
        </Link>
      </div>
    );
  }

  const currentAdaptedContent = adaptContent(post ? post.content : '', readingMode, post ? post.title : '');
  const totalModeMinutes = calculateReadingTime(currentAdaptedContent);
  const remainingMinutes = Math.max(0, Math.ceil(totalModeMinutes * (1 - scrollPercent / 100)));

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const isOwner = user && (user._id === (post.author._id || post.author) || user.role === 'admin');

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Sticky Top Reading Progress & Time Remaining Bar */}
      {isScrolled && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'var(--bg-card)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--accent-primary)',
            padding: '0.65rem 1.5rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '380px' }}>
              {post.title}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--accent-primary)', whiteSpace: 'nowrap' }}>
                ⏳ {remainingMinutes} min remaining ({Math.round(scrollPercent)}%)
              </span>
              <div style={{ width: '110px', height: '6px', background: 'rgba(99,102,241,0.2)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${scrollPercent}%`, height: '100%', background: 'var(--accent-gradient)', transition: 'width 0.15s ease-out' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Auth Required Modal */}
      <Modal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title="Authentication Required"
        message="Sign in to your MindNest account to like articles, leave comments, and support authors."
        actionText="Log In Now"
        actionLink="/login"
      />

      {/* Custom Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Article?"
        message={`Are you sure you want to delete "${post.title}"? This action cannot be undone.`}
        type="danger"
        actionText="Yes, Delete Article"
        confirmDanger={true}
        onAction={confirmDeletePost}
      />

      {/* Custom Toast Notification */}
      <Toast
        isOpen={toastOpen}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />

      {/* Back Button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" className="btn btn-secondary btn-sm" style={{ border: 'none' }}>
          <ArrowLeft size={16} /> Back to Articles
        </Link>
      </div>

      {/* Main Post Article Box */}
      <article className="glass-panel" style={{ overflow: 'hidden', padding: '2rem' }}>
        {/* Cover Image */}
        {post.coverImage && (
          <div style={{ width: '100%', maxHeight: '420px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '2rem' }}>
            <img
              src={post.coverImage}
              alt={post.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {post.tags.map((t, idx) => (
              <span key={idx} className="tag-chip">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Status Badge if Draft */}
        {post.status === 'draft' && (
          <div style={{ marginBottom: '1rem' }}>
            <span className="badge-draft">DRAFT — Visible only to author/admin</span>
          </div>
        )}

        {/* Post Title */}
        <h1 style={{ fontSize: '2.4rem', marginBottom: '1.25rem', lineHeight: '1.25', color: 'var(--text-primary)' }}>
          {post.title}
        </h1>

        {/* Author Metadata Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justify: 'space-between',
            gap: '1rem',
            padding: '1rem 0',
            borderTop: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '1.5rem'
          }}
        >
          {/* Author Card */}
          <Link
            to={`/user/${post.author?.username}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}
          >
            <img
              src={post.author?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${post.author?.username}`}
              alt={post.author?.name}
              style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }}
            />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{post.author?.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>@{post.author?.username}</div>
            </div>
          </Link>

          {/* Reading Time & Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <span>{formattedDate}</span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              <Clock size={14} /> {totalModeMinutes} min read
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Eye size={14} /> {post.views} views
            </span>
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to={`/edit/${post._id}`} className="btn btn-secondary btn-sm">
                <Edit3 size={14} /> Edit
              </Link>
              <button onClick={() => setDeleteModalOpen(true)} className="btn btn-danger btn-sm">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Adaptive Reading Mode Selector */}
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            background: 'rgba(99, 102, 241, 0.05)',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              ⏱️ How much time do you have? Select reading experience:
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Content length adapts dynamically
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => setReadingMode('2min')}
              className={`btn btn-sm ${readingMode === '2min' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ opacity: readingMode === '2min' ? 1 : 0.75, justifyContent: 'flex-start' }}
            >
              <Zap size={15} color={readingMode === '2min' ? '#fff' : '#eab308'} /> ⚡ 2 min — Gist
            </button>
            <button
              type="button"
              onClick={() => setReadingMode('5min')}
              className={`btn btn-sm ${readingMode === '5min' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ opacity: readingMode === '5min' ? 1 : 0.75, justifyContent: 'flex-start' }}
            >
              <Coffee size={15} color={readingMode === '5min' ? '#fff' : '#f97316'} /> ☕ 5 min — Key Parts
            </button>
            <button
              type="button"
              onClick={() => setReadingMode('10min')}
              className={`btn btn-sm ${readingMode === '10min' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ opacity: readingMode === '10min' ? 1 : 0.75, justifyContent: 'flex-start' }}
            >
              <BookOpen size={15} color={readingMode === '10min' ? '#fff' : '#6366f1'} /> 📖 10 min — Explore
            </button>
            <button
              type="button"
              onClick={() => setReadingMode('20min')}
              className={`btn btn-sm ${readingMode === '20min' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ opacity: readingMode === '20min' ? 1 : 0.75, justifyContent: 'flex-start' }}
            >
              <Armchair size={15} color={readingMode === '20min' ? '#fff' : '#a855f7'} /> 🛋️ 20+ min — Full
            </button>
          </div>
        </div>

        {/* Markdown Rendered Body */}
        <div className="markdown-body" style={{ marginBottom: '2.5rem' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentAdaptedContent}</ReactMarkdown>
        </div>

        {/* Post Footer Action Bar (Like & Share) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-color)'
          }}
        >
          <button
            onClick={handleToggleLike}
            disabled={liking}
            className={`btn ${isLiked ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              borderRadius: '9999px',
              padding: '0.6rem 1.5rem',
              background: isLiked ? 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)' : undefined
            }}
          >
            <Heart size={18} fill={isLiked ? '#fff' : 'transparent'} color={isLiked ? '#fff' : '#ec4899'} />
            <span>{isLiked ? 'Liked' : 'Like Post'} ({likesCount})</span>
          </button>

          <div style={{ position: 'relative' }}>
            {copiedTooltip && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '125%',
                  right: 0,
                  background: '#22c55e',
                  color: '#ffffff',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  zIndex: 20,
                  animation: 'fadeIn 0.2s ease-out'
                }}
              >
                <Check size={14} /> Link copied successfully!
              </div>
            )}
            <button onClick={handleShare} className="btn btn-secondary btn-sm">
              <Share2 size={16} /> Share
            </button>
          </div>
        </div>
      </article>

      {/* Integrated Comments Thread */}
      <CommentSection postId={post._id} postAuthorId={post.author?._id || post.author} />
    </div>
  );
};

export default PostDetailPage;
