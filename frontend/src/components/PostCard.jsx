import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Clock, Tag } from 'lucide-react';

const PostCard = ({ post }) => {
  // Calculate reading time estimate
  const words = post.content ? post.content.split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
      {/* Cover Image or Gradient Header */}
      <Link to={`/post/${post.slug || post._id}`}>
        {post.coverImage ? (
          <div style={{ width: '100%', height: '180px', overflow: 'hidden' }}>
            <img
              src={post.coverImage}
              alt={post.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div
            style={{
              width: '100%',
              height: '140px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              borderBottom: '1px solid var(--border-color)'
            }}
          >
            <span style={{ fontSize: '2.5rem', opacity: 0.4 }}>✍️</span>
          </div>
        )}
      </Link>

      {/* Card Content Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
            {post.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="tag-chip">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', lineHeight: '1.35' }}>
          <Link
            to={`/post/${post.slug || post._id}`}
            style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--accent-primary)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--text-primary)')}
          >
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.excerpt || post.content.slice(0, 120) + '...'}
        </p>

        {/* Card Footer Info */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
          {/* Author */}
          {post.author && (
            <Link
              to={`/user/${post.author.username}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
            >
              <img
                src={post.author.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${post.author.username}`}
                alt={post.author.name}
                style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                {post.author.name}
              </span>
            </Link>
          )}

          {/* Stats: Reading time, Likes, Views */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Clock size={12} /> {readingTime}m
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Heart size={12} color="#ec4899" /> {post.likes ? post.likes.length : 0}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Eye size={12} /> {post.views || 0}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
