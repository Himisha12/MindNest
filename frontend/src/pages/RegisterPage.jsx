import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EmailVerificationModal from '../components/EmailVerificationModal';
import { Sparkles, UserPlus, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !username || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register({ name, username, email, password, bio });
      setShowVerifyModal(true);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '2.5rem auto' }}>
      {/* Mandatory Email OTP Verification Modal centered in middle of screen */}
      <EmailVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        isBlocking={true}
        onSuccess={() => navigate('/dashboard')}
      />

      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--accent-gradient)',
              display: 'inline-flex',
              alignItems: 'center',
              justify: 'center',
              marginBottom: '1rem',
              boxShadow: '0 6px 16px var(--accent-glow)'
            }}
          >
            <Sparkles size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Create Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            Join AuraBlog to publish blogs and connect with creators
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.85rem',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#fca5a5',
              fontSize: '0.88rem',
              marginBottom: '1.25rem'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Full / Display Name *</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Username * (Unique)</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. alexmorgan"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email Address *</label>
            <input
              type="email"
              className="input-field"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password * (Min 6 characters)</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: '1.75rem' }}>
            <label className="input-label">Author Bio (Optional)</label>
            <textarea
              className="input-field"
              rows="2"
              placeholder="Tell readers a bit about your passions or background..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }}
          >
            <UserPlus size={18} /> {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)'
          }}
        >
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Sign In <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
