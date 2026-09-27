import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, X, CheckCircle, AlertTriangle, AlertCircle, Trash2 } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info', // 'info' | 'success' | 'danger'
  actionText,
  actionLink,
  onAction,
  confirmDanger = false
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionLink) {
      navigate(actionLink);
    }
    onClose();
  };

  const getIcon = () => {
    if (type === 'danger') return <AlertTriangle size={28} color="#ef4444" />;
    if (type === 'success') return <CheckCircle size={28} color="#22c55e" />;
    return <AlertCircle size={28} color="var(--accent-primary)" />;
  };

  const getIconBg = () => {
    if (type === 'danger') return 'rgba(239, 68, 68, 0.15)';
    if (type === 'success') return 'rgba(34, 197, 94, 0.15)';
    return 'rgba(99, 102, 241, 0.15)';
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
        zIndex: 2000,
        margin: 0,
        padding: 0
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '440px',
          width: '90%',
          padding: '2rem',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          margin: 0,
          zIndex: 2001,
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
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

        {/* Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: getIconBg(),
              display: 'inline-flex',
              alignItems: 'center',
              justify: 'center',
              marginBottom: '1rem'
            }}
          >
            {getIcon()}
          </div>

          <h3 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {title}
          </h3>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          {actionText && (
            <button
              onClick={handleAction}
              className={`btn ${confirmDanger ? 'btn-danger' : 'btn-primary'}`}
              style={{ flex: 1 }}
            >
              {confirmDanger ? <Trash2 size={16} /> : <LogIn size={16} />} {actionText}
            </button>
          )}

          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ flex: actionText ? '1' : 1 }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
