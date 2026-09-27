import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Modal from './Modal';
import Toast from './Toast';
import { MessageSquare, Send, Trash2, LogIn } from 'lucide-react';

const CommentSection = ({ postId, postAuthorId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Modal & Toast States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/posts/${postId}/comments`);
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setSubmitting(true);
      setError('');
      const { data } = await api.post(`/posts/${postId}/comments`, { content });
      setComments([data, ...comments]);
      setContent('');
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (commentId) => {
    setCommentToDelete(commentId);
    setDeleteModalOpen(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      await api.delete(`/posts/${postId}/comments/${commentToDelete}`);
      setComments(comments.filter((c) => c._id !== commentToDelete));
      setToastMessage('Comment deleted successfully.');
      setToastOpen(true);
    } catch (err) {
      setToastMessage(err.message || 'Failed to delete comment');
      setToastOpen(true);
    } finally {
      setCommentToDelete(null);
    }
  };

  return (
    <section className="glass-panel" style={{ padding: '1.5rem', marginTop: '2.5rem' }}>
      {/* Custom Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCommentToDelete(null);
        }}
        title="Delete Comment?"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        type="danger"
        actionText="Yes, Delete Comment"
        confirmDanger={true}
        onAction={confirmDeleteComment}
      />

      {/* Custom Toast Notification */}
      <Toast
        isOpen={toastOpen}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
        <MessageSquare size={22} color="var(--accent-primary)" />
        <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)' }}>
          Discussion ({comments.length})
        </h3>
      </div>

      {/* Write Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          {error && (
            <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`}
              alt={user.name}
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', marginTop: '0.2rem' }}
            />
            <div style={{ flex: 1 }}>
              <textarea
                className="input-field"
                rows="3"
                placeholder="Share your thoughts on this blog post..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ resize: 'vertical', marginBottom: '0.75rem' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="btn btn-primary btn-sm"
                  style={{ opacity: submitting || !content.trim() ? 0.6 : 1 }}
                >
                  <Send size={14} /> {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div
          style={{
            padding: '1.25rem',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            marginBottom: '2rem'
          }}
        >
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Want to join the conversation and leave a comment?
          </span>
          <Link to="/login" className="btn btn-primary btn-sm">
            <LogIn size={14} /> Log In to Comment
          </Link>
        </div>
      )}

      {/* Comments Feed List */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading discussion...</p>
      ) : comments.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '1rem 0' }}>
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {comments.map((comment) => {
            const isCommentAuthor = user && user._id === comment.author?._id;
            const isPostOwner = user && user._id === postAuthorId;
            const canDelete = isCommentAuthor || isPostOwner || (user && user.role === 'admin');

            const timeAgo = new Date(comment.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={comment._id}
                style={{
                  padding: '1rem',
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <Link
                    to={`/user/${comment.author?.username}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                  >
                    <img
                      src={comment.author?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${comment.author?.username}`}
                      alt={comment.author?.name}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {comment.author?.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                        @{comment.author?.username}
                      </span>
                    </div>
                  </Link>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{timeAgo}</span>
                    {canDelete && (
                      <button
                        onClick={() => openDeleteModal(comment._id)}
                        style={{ color: '#ef4444', opacity: 0.8 }}
                        title="Delete comment"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', whiteSpace: 'pre-wrap', paddingLeft: '2.3rem' }}>
                  {comment.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CommentSection;
