import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EmailVerificationModal from './EmailVerificationModal';
import {
  Sparkles,
  PenSquare,
  LayoutDashboard,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Sun,
  Moon,
  CheckCircle,
  Mail,
  ShieldCheck
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  // Theme State (Dark / Light Theme)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
      />

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo - MindNest */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px var(--accent-glow)' }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }} className="text-gradient">
              MindNest
            </span>
          </div>
        </Link>

        {/* Navigation Links & Theme Switcher */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Link to="/" className="btn btn-secondary btn-sm" style={{ border: 'none', background: 'transparent' }}>
            Explore Feed
          </Link>

          {/* Light / Dark Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.45rem', borderRadius: '50%' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          >
            {theme === 'dark' ? <Sun size={17} color="#fde047" /> : <Moon size={17} color="#6366f1" />}
          </button>

          {user ? (
            <>
              <Link to="/write" className="btn btn-primary btn-sm">
                <PenSquare size={16} /> Write Post
              </Link>

              {/* User Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)' }}
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`}
                    alt={user.name}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</span>
                  {user.isEmailVerified ? (
                    <CheckCircle size={14} color="#22c55e" title="Verified Email Account" />
                  ) : (
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} title="Email Not Verified" />
                  )}
                </button>

                {userDropdownOpen && (
                  <div
                    className="glass-panel"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '120%',
                      width: '230px',
                      padding: '0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      zIndex: 110
                    }}
                  >
                    <div style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.25rem' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        {user.name}
                        {user.isEmailVerified && <CheckCircle size={13} color="#22c55e" />}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                        <span className="badge-role">{(user.role || 'author').toUpperCase()}</span>
                        <span style={{ fontSize: '0.72rem', color: user.isEmailVerified ? '#22c55e' : '#eab308', fontWeight: 600 }}>
                          {user.isEmailVerified ? '✓ Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>

                    {!user.isEmailVerified && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setVerifyModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ justifyContent: 'flex-start', border: 'none', width: '100%', color: '#eab308' }}
                      >
                        <ShieldCheck size={16} /> Verify Email
                      </button>
                    )}

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'flex-start', border: 'none', width: '100%' }}
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <Link
                      to={`/user/${user.username}`}
                      onClick={() => setUserDropdownOpen(false)}
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'flex-start', border: 'none', width: '100%' }}
                    >
                      <User size={16} /> Public Profile
                    </Link>
                    <hr style={{ borderColor: 'var(--border-color)', margin: '0.25rem 0' }} />
                    <button
                      onClick={handleLogout}
                      className="btn btn-danger btn-sm"
                      style={{ justifyContent: 'flex-start', width: '100%' }}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                <LogIn size={16} /> Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={16} /> Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
