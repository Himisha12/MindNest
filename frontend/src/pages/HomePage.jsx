import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PostCard from '../components/PostCard';
import SearchFilter from '../components/SearchFilter';
import { Sparkles, BookOpen, PenSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState('latest');
  const [total, setTotal] = useState(0);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (tag) params.tag = tag;
      if (sort) params.sort = sort;

      const { data } = await api.get('/posts', { params });
      setPosts(data.posts || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, tag, sort]);

  return (
    <div>
      {/* Hero Banner Section */}
      <section
        className="glass-panel"
        style={{
          padding: '3.5rem 2rem',
          marginBottom: '2.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 1rem',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--accent-primary)',
            marginBottom: '1.25rem'
          }}
        >
          <Sparkles size={16} /> Welcome to MindNest
        </div>

        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
          Explore Ideas, Stories & <span className="text-gradient">Perspectives</span>
        </h1>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '1.15rem',
            maxWidth: '680px',
            margin: '0 auto 2rem auto',
            lineHeight: '1.6'
          }}
        >
          Discover high-quality articles written by creators, engineers, and designers. Read freely, write your own markdown blogs, and engage through likes and discussions.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/write" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
            <PenSquare size={18} /> Start Writing
          </Link>
          <a href="#feed" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
            <BookOpen size={18} /> Browse Articles
          </a>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <div id="feed">
        <SearchFilter
          search={search}
          setSearch={setSearch}
          tag={tag}
          setTag={setTag}
          sort={sort}
          setSort={setSort}
        />
      </div>

      {/* Main Feed Section */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading published blogs...
        </div>
      ) : posts.length === 0 ? (
        <div
          className="glass-panel"
          style={{ padding: '4rem 2rem', textAlign: 'center', margin: '2rem 0' }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No posts found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {search || tag
              ? `No published articles matched "${search || tag}". Try resetting your filters.`
              : 'Be the pioneer! Create the very first blog post on MindNest.'}
          </p>
          <Link to="/write" className="btn btn-primary">
            <PenSquare size={16} /> Write First Article
          </Link>
        </div>
      ) : (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              marginBottom: '1.25rem'
            }}
          >
            <h2 style={{ fontSize: '1.4rem' }}>
              Published Articles ({total})
            </h2>
            {tag && (
              <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Filtering by tag: <strong style={{ color: 'var(--accent-primary)' }}>#{tag}</strong>
              </span>
            )}
          </div>

          <div className="posts-grid">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
