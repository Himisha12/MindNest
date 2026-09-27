import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import {
  PenSquare,
  FileText,
  Eye,
  Heart,
  Edit3,
  Trash2,
  ExternalLink
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('published'); // 'published' | 'draft'

  // Modal & Toast States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/posts/user/me');
      setPosts(data || []);
    } catch (err) {
      console.error('Failed to fetch user posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const openDeleteModal = (post) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete) return;

    try {
      await api.delete(`/posts/${postToDelete._id}`);
      setPosts(posts.filter((p) => p._id !== postToDelete._id));
      setToastMessage('Article deleted successfully.');
      setToastOpen(true);
    } catch (err) {
      setToastMessage(err.message || 'Failed to delete post');
      setToastOpen(true);
    } finally {
      setPostToDelete(null);
    }
  };

  const publishedPosts = posts.filter((p) => p.status === 'published');
  const draftPosts = posts.filter((p) => p.status === 'draft');

  const totalViews = publishedPosts.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalLikes = publishedPosts.reduce((acc, p) => acc + (p.likes ? p.likes.length : 0), 0);

  const displayedPosts = activeTab === 'published' ? publishedPosts : draftPosts;

  return (
    <div>
      {/* Custom Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setPostToDelete(null);
        }}
        title="Delete Article?"
        message={`Are you sure you want to delete "${postToDelete?.title}"? This action cannot be undone.`}
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

      {/* Header Dashboard Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justify: 'space-between',
          gap: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.username}`}
            alt={user?.name}
            style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-primary)' }}
          />
          <div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>
              Author Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong>! Manage your articles and track performance.
            </p>
          </div>
        </div>

        <Link to="/write" className="btn btn-primary">
          <PenSquare size={18} /> Create New Post
        </Link>
      </div>

      {/* Analytics Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Total Articles</span>
            <FileText size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{posts.length}</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {publishedPosts.length} published • {draftPosts.length} drafts
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Total Article Views</span>
            <Eye size={18} color="#a855f7" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalViews}</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Across all published posts</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Total Likes Received</span>
            <Heart size={18} color="#ec4899" fill="#ec4899" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalLikes}</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>From readers</span>
        </div>
      </div>

      {/* Posts Tabs & Management List */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        {/* Tab Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('published')}
            className={`btn btn-sm ${activeTab === 'published' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            Published ({publishedPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`btn btn-sm ${activeTab === 'draft' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            Drafts ({draftPosts.length})
          </button>
        </div>

        {/* Table / List */}
        {loading ? (
          <p style={{ color: 'var(--text-secondary)', padding: '2rem 0', textAlign: 'center' }}>
            Loading your articles...
          </p>
        ) : displayedPosts.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: '1rem' }}>No {activeTab} articles found.</p>
            <Link to="/write" className="btn btn-secondary btn-sm">
              <PenSquare size={14} /> Start Writing
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {displayedPosts.map((post) => {
              const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div
                  key={post._id}
                  style={{
                    padding: '1.25rem',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justify: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <span className={post.status === 'published' ? 'badge-published' : 'badge-draft'}>
                        {post.status.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Created {formattedDate}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>
                      <Link to={`/post/${post.slug || post._id}`} style={{ color: 'var(--text-primary)' }}>
                        {post.title}
                      </Link>
                    </h3>

                    {post.tags && post.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        {post.tags.map((t, idx) => (
                          <span key={idx} style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Performance Indicators */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Eye size={14} /> {post.views || 0}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Heart size={14} color="#ec4899" /> {post.likes ? post.likes.length : 0}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Link
                      to={`/post/${post.slug || post._id}`}
                      className="btn btn-secondary btn-sm"
                      title="Preview article"
                    >
                      <ExternalLink size={14} /> View
                    </Link>
                    <Link
                      to={`/edit/${post._id}`}
                      className="btn btn-secondary btn-sm"
                      title="Edit article"
                    >
                      <Edit3 size={14} /> Edit
                    </Link>
                    <button
                      onClick={() => openDeleteModal(post)}
                      className="btn btn-danger btn-sm"
                      title="Delete article"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
