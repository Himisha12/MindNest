import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle, RefreshCw, X, ShieldCheck } from 'lucide-react';

const EmailVerificationModal = ({
  isOpen,
  onClose,
  initialCode = '',
  isBlocking = false,
  onSuccess
}) => {
  const { user, verifyEmail, resendVerification } = useAuth();
  const [code, setCode] = useState(initialCode);
  const [simulatedCode, setSimulatedCode] = useState(
    initialCode || (user ? user.verificationCodeSimulated : '')
  );
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !user) return null;

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    try {
      setVerifying(true);
      setError('');
      setMessage('');

      await verifyEmail(code.trim());

      setSuccess(true);
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
        setSuccess(false);
      }, 1800);
    } catch (err) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      setError('');
      const data = await resendVerification();
      if (data.verificationCodeSimulated) {
        setSimulatedCode(data.verificationCodeSimulated);
        setCode(data.verificationCodeSimulated);
      }
      setMessage(data.message || 'New OTP verification code sent to your email!');
    } catch (err) {
      setError(err.message || 'Failed to resend verification code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        zIndex: 2500,
        margin: 0,
        padding: 0
      }}
      onClick={isBlocking ? undefined : onClose}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '460px',
          width: '90%',
          padding: '2.25rem',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          margin: 0,
          zIndex: 2501,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - hidden when isBlocking */}
        {!isBlocking && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.15)',
                display: 'inline-flex',
                alignItems: 'center',
                justify: 'center',
                marginBottom: '1rem'
              }}
            >
              <CheckCircle size={36} color="#22c55e" />
            </div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Email Verified!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Your account is now fully authenticated with verified status.
            </p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.15)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justify: 'center',
                  marginBottom: '1rem'
                }}
              >
                <Mail size={28} color="var(--accent-primary)" />
              </div>

              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Verify Your Email
              </h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.5' }}>
                We sent a 6-digit authorization code to <br />
                <strong style={{ color: 'var(--accent-primary)' }}>{user.email}</strong>
              </p>
            </div>

            {/* Simulated Email Notification Card */}
            {(simulatedCode || initialCode) && (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px dashed rgba(99, 102, 241, 0.4)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  textAlign: 'center'
                }}
              >
                <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                  📬 Real Nodemailer OTP Email Delivered:
                </span>
                Verification OTP: <strong style={{ color: 'var(--accent-primary)', fontSize: '1.1rem', letterSpacing: '2px' }}>{simulatedCode || initialCode}</strong>
              </div>
            )}

            {error && (
              <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: '#fca5a5', fontSize: '0.88rem', marginBottom: '1rem', textAlign: 'center' }}>
                {error}
              </div>
            )}

            {message && (
              <div style={{ padding: '0.75rem', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 'var(--radius-md)', color: '#4ade80', fontSize: '0.88rem', marginBottom: '1rem', textAlign: 'center' }}>
                {message}
              </div>
            )}

            <form onSubmit={handleVerify}>
              <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                <label className="input-label" style={{ textAlign: 'center', display: 'block' }}>
                  Enter 6-Digit Authorization Code
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 849201"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  style={{
                    textAlign: 'center',
                    fontSize: '1.4rem',
                    letterSpacing: '4px',
                    fontWeight: 700,
                    fontFamily: 'monospace'
                  }}
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                disabled={verifying || !code.trim()}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem', fontSize: '1rem' }}
              >
                <ShieldCheck size={18} /> {verifying ? 'Verifying...' : 'Verify Email Address'}
              </button>
            </form>

            <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <RefreshCw size={14} className={resending ? 'spin' : ''} />
                {resending ? 'Resending Code...' : "Didn't get code? Resend Code"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationModal;
