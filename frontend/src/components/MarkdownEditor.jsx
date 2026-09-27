import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bold, Italic, Heading, Code, Quote, Link as LinkIcon, Image, Eye, Edit3, Upload } from 'lucide-react';

const MarkdownEditor = ({ value, onChange, placeholder = 'Write your blog post in markdown...' }) => {
  const [activeTab, setActiveTab] = useState('split'); // 'edit' | 'preview' | 'split'
  const [showImageModal, setShowImageModal] = useState(false);
  const [inlineImageUrl, setInlineImageUrl] = useState('');

  const insertFormatting = (prefix, suffix = '') => {
    const textarea = document.getElementById('markdown-input');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || 'text';
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 50);
  };

  const handleInlineImageInsert = (url) => {
    if (!url) return;
    const markdownImg = `\n![Article Image](${url})\n`;
    onChange(value + markdownImg);
    setShowImageModal(false);
    setInlineImageUrl('');
  };

  const handleInlineFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      handleInlineImageInsert(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      {/* Inline Image Modal */}
      {showImageModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            zIndex: 1200,
            padding: '1rem'
          }}
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="glass-panel"
            style={{ maxWidth: '420px', width: '100%', padding: '1.5rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Insert Article Image
            </h3>
            
            <div className="input-group">
              <label className="input-label">Image URL</label>
              <input
                type="url"
                className="input-field"
                placeholder="https://images.unsplash.com/..."
                value={inlineImageUrl}
                onChange={(e) => setInlineImageUrl(e.target.value)}
              />
            </div>

            <div style={{ textAlign: 'center', margin: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              — OR —
            </div>

            <label className="btn btn-secondary" style={{ width: '100%', cursor: 'pointer', marginBottom: '1.25rem' }}>
              <Upload size={16} /> Choose Image File from Device
              <input
                type="file"
                accept="image/*"
                onChange={handleInlineFileUpload}
                style={{ display: 'none' }}
              />
            </label>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => handleInlineImageInsert(inlineImageUrl)}
                disabled={!inlineImageUrl}
                className="btn btn-primary btn-sm"
              >
                Insert Image
              </button>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Toolbar Header */}
      <div
        style={{
          padding: '0.65rem 1rem',
          background: 'var(--bg-glass)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justify: 'space-between',
          gap: '0.5rem'
        }}
      >
        {/* Formatting Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button
            type="button"
            onClick={() => insertFormatting('**', '**')}
            title="Bold"
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.3rem 0.5rem' }}
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*')}
            title="Italic"
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.3rem 0.5rem' }}
          >
            <Italic size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('## ')}
            title="Heading"
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.3rem 0.5rem' }}
          >
            <Heading size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('`', '`')}
            title="Code"
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.3rem 0.5rem' }}
          >
            <Code size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('> ')}
            title="Blockquote"
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.3rem 0.5rem' }}
          >
            <Quote size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('[', '](https://example.com)')}
            title="Link"
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.3rem 0.5rem' }}
          >
            <LinkIcon size={15} />
          </button>
          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            title="Insert Image File or URL"
            className="btn btn-primary btn-sm"
            style={{ padding: '0.3rem 0.65rem' }}
          >
            <Image size={15} /> Insert Image
          </button>
        </div>

        {/* View Mode Switches */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--bg-glass)', padding: '0.2rem', borderRadius: 'var(--radius-sm)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`btn btn-sm ${activeTab === 'edit' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', border: 'none' }}
          >
            <Edit3 size={13} /> Edit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('split')}
            className={`btn btn-sm ${activeTab === 'split' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', border: 'none' }}
          >
            Split View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`btn btn-sm ${activeTab === 'preview' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', border: 'none' }}
          >
            <Eye size={13} /> Preview
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: activeTab === 'split' ? '1fr 1fr' : '1fr',
          minHeight: '400px'
        }}
      >
        {/* Editor Pane */}
        {(activeTab === 'edit' || activeTab === 'split') && (
          <textarea
            id="markdown-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
              width: '100%',
              height: '100%',
              minHeight: '400px',
              padding: '1.25rem',
              background: 'transparent',
              border: 'none',
              borderRight: activeTab === 'split' ? '1px solid var(--border-color)' : 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        )}

        {/* Live Preview Pane */}
        {(activeTab === 'preview' || activeTab === 'split') && (
          <div
            className="markdown-body"
            style={{
              padding: '1.25rem',
              overflowY: 'auto',
              maxHeight: '600px',
              background: 'var(--bg-glass)'
            }}
          >
            {value && value.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Live Markdown preview will appear here as you type...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
