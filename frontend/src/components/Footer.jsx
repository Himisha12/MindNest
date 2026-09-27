import React from 'react';
import { Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-color)',
        padding: '2rem 1.5rem',
        marginTop: 'auto',
        background: 'var(--bg-secondary)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justify: 'space-between',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
            MindNest
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            — Share ideas, discover perspectives, and engage with technical blogs.
          </span>
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} MindNest. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
