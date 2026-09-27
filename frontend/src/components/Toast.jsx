import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

const Toast = ({ message, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--accent-primary)',
        boxShadow: 'var(--shadow-lg)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        zIndex: 1100,
        color: 'var(--text-primary)',
        backdropFilter: 'blur(16px)'
      }}
    >
      <CheckCircle size={20} color="#22c55e" />
      <span style={{ fontSize: '0.92rem', fontWeight: 500 }}>{message}</span>
      <button onClick={onClose} style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
