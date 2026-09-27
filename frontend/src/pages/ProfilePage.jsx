import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PostCard from '../components/PostCard';
import Toast from '../components/Toast';
import { User, Calendar, FileText, Heart, Eye, Edit3, Save, Check } from 'lucide-react';

const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser, updateProfile } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ totalPosts: 0, totalLikes: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Toast State
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Edit bio state for profile owner
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/users/${username}`);
      setProfileUser(data.user);
      setPosts(data.posts || []);
      setStats(data.stats || { totalPosts: 0, totalLikes: 0, totalViews: 0 });

      setEditName(data.user.name);
      setEditBio(data.user.bio || '');
      setEditAvatar(data.user.avatar || '');
    } catch (err) {
      setError(err.message || 'User profile not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await updateProfile({
        name: editName,
        bio: editBio,
        avatar: editAvatar
      });
      setProfileUser((prev) => ({ ...prev, ...updated }));
      setIsEditing(false);
      setToastMessage('Profile updated successfully!');
      setToastOpen(true);
    } catch (err) {
      setToastMessage(err.message || 'Failed to update profile');
      setToastOpen(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading author profile...
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', margin: '3rem 0' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#ef4444', marginBottom: '1rem' }}>Profile Not Found</h2>
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
      </div>
    );
  }

  const isSelf = currentUser && currentUser._id === profileUser._id;

  const joinedDate = new Date(profileUser.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Toast Notification */}
      <Toast
        isOpen={toastOpen}
        message={toastMessage}
        onClose={() => setToastOpen(false)}
      />

      {/* Profile Header Banner */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem', position: 'relative' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '2rem' }}>
          {/* Avatar */}
          <img
            src={profileUser.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${profileUser.username}`}
            alt={profileUser.name}
            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--accent-primary)', boxShadow: '0 8px 20px var(--accent-glow)' }}
          />

          {/* Profile Details */}
          <div style={{ flex: 1, minWidth: '280px' }}>
            {!isEditing ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
                  <div>
                    <h1 style={{ fontSize: '2rem', lineHeight: '1.2', color: 'var(--text-primary)' }}>{profileUser.name}</h1>
                    <span style={{ fontSize: '0.95rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      @{profileUser.username}
                    </span>
                  </div>

                  {isSelf && (
                    <button onClick={() => setIsEditing(true)} className="btn btn-secondary btn-sm">
                      <Edit3 size={15} /> Edit Profile
                    </button>
                  )}
                </div>

                <p style={{ color: 'var(--text-primary)', fontSize: '1rem', margin: '0.85rem 0 1.25rem 0', lineHeight: '1.6' }}>
                  {profileUser.bio || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No bio written yet.</span>}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={15} /> Joined {joinedDate}
                  </span>
                </div>
              </>
            ) : (
              /* Inline Edit Form for Profile Owner */
              <form onSubmit={handleSaveProfile}>
                <div className="input-group">
                  <label className="input-label">Display Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Avatar Image URL</label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://..."
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Bio (Max 300 characters)</label>
                  <textarea
                    className="input-field"
                    rows="3"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    maxLength={300}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
                    <Save size={14} /> {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Stats Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center'
          }}
        >
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.totalPosts}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Published Articles</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.totalViews}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Total Views</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.totalLikes}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Likes Received</div>
          </div>
        </div>
      </div>

      {/* Published Posts by Author */}
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
        Articles by {profileUser.name} ({posts.length})
      </h2>

      {posts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          This author hasn't published any articles yet.
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
