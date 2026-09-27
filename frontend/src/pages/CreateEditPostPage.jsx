import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import MarkdownEditor from '../components/MarkdownEditor';
import { Save, Send, Image, Tag, ArrowLeft, Upload, FileText, CheckCircle, Info } from 'lucide-react';

const CreateEditPostPage = () => {
  const { id } = useParams(); // If id exists, edit mode
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('published');
  const [content, setContent] = useState('');

  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  useEffect(() => {
    if (id) {
      const fetchPostToEdit = async () => {
        try {
          setLoading(true);
          const { data } = await api.get(`/posts/${id}`);
          setTitle(data.title || '');
          setExcerpt(data.excerpt || '');
          setCoverImage(data.coverImage || '');
          setTags(data.tags ? data.tags.join(', ') : '');
          setStatus(data.status || 'published');
          setContent(data.content || '');
        } catch (err) {
          setError(err.message || 'Failed to load post for editing');
        } finally {
          setLoading(false);
        }
      };

      fetchPostToEdit();
    }
  }, [id]);

  // File Upload & Smart Content Detection Handler (.md, .txt)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawText = event.target.result;
      if (!rawText) return;

      parseBlogFile(rawText, file.name);
    };
    reader.readAsText(file);
  };

  // Image Upload Handler for Cover Image (Converts file to Base64/DataURL)
  const handleCoverImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverImage(event.target.result);
      setUploadSuccess(`Cover image uploaded from file "${file.name}"!`);
      setTimeout(() => setUploadSuccess(''), 4000);
    };
    reader.readAsDataURL(file);
  };

  const parseBlogFile = (rawText, fileName) => {
    const lines = rawText.split('\n');
    let detectedTitle = '';
    let detectedSubtitle = '';
    let detectedTags = [];
    let contentStartIdx = 0;

    // 1. Detect Title (Look for # Title, Title: ..., or first non-empty line)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.startsWith('# ')) {
        detectedTitle = line.replace(/^#\s+/, '').trim();
        contentStartIdx = i + 1;
        break;
      } else if (line.toLowerCase().startsWith('title:')) {
        detectedTitle = line.replace(/^title:\s*/i, '').trim();
        contentStartIdx = i + 1;
        break;
      } else if (!detectedTitle) {
        detectedTitle = line.replace(/^[#*_\s]+/, '').trim();
        contentStartIdx = i + 1;
        break;
      }
    }

    if (!detectedTitle) {
      detectedTitle = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    }

    // 2. Detect Subtitle / Excerpt
    for (let i = contentStartIdx; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.startsWith('## ')) {
        detectedSubtitle = line.replace(/^##\s+/, '').trim();
        break;
      } else if (line.toLowerCase().startsWith('subtitle:') || line.toLowerCase().startsWith('excerpt:')) {
        detectedSubtitle = line.replace(/^(subtitle|excerpt):\s*/i, '').trim();
        break;
      } else if (!detectedSubtitle && line.length > 20 && !line.startsWith('#')) {
        detectedSubtitle = line.slice(0, 160) + '...';
        break;
      }
    }

    // 3. Detect Tags
    const tagsMatch = rawText.match(/tags:\s*\[?(.*?)\]?$/im);
    if (tagsMatch && tagsMatch[1]) {
      detectedTags = tagsMatch[1].split(/[,;]/).map(t => t.trim()).filter(Boolean);
    }

    // Populate state fields
    setTitle(detectedTitle);
    if (detectedSubtitle) setExcerpt(detectedSubtitle);
    if (detectedTags.length > 0) setTags(detectedTags.join(', '));
    setContent(rawText);

    setUploadSuccess(`Successfully imported blog from file "${fileName}"! Title, excerpt, and content detected.`);
    setTimeout(() => setUploadSuccess(''), 6000);
  };

  const handleSubmit = async (e, targetStatus) => {
    if (e) e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Post title and content are required');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const postData = {
        title,
        excerpt,
        coverImage,
        tags,
        status: targetStatus || status,
        content
      };

      let response;
      if (id) {
        response = await api.put(`/posts/${id}`, postData);
      } else {
        response = await api.post('/posts', postData);
      }

      navigate(`/post/${response.data.slug || response.data._id}`);
    } catch (err) {
      setError(err.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading post data...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Back Button */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ border: 'none' }}>
          <ArrowLeft size={16} /> Cancel
        </button>

        <h2 style={{ fontSize: '1.5rem' }}>
          {id ? 'Edit Article' : 'Write New Article'}
        </h2>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#fca5a5',
            marginBottom: '1.5rem'
          }}
        >
          {error}
        </div>
      )}

      {uploadSuccess && (
        <div
          style={{
            padding: '1rem',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#4ade80',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <CheckCircle size={18} /> {uploadSuccess}
        </div>
      )}

      {/* File Upload Box (Auto Detection Feature) */}
      {!id && (
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem',
            background: 'rgba(99, 102, 241, 0.06)',
            border: '1px dashed rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={24} color="var(--accent-primary)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.98rem' }}>Upload Blog File (.md or .txt)</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Auto-detects title, subtitle, and content automatically from your uploaded markdown file.
              </div>
            </div>
          </div>

          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
            <Upload size={15} /> Choose Blog File
            <input
              type="file"
              accept=".md,.txt,.markdown"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      )}

      {/* Main Author Form */}
      <form onSubmit={(e) => handleSubmit(e, status)}>
        <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          {/* Post Title Input */}
          <div className="input-group">
            <label className="input-label">Article Title *</label>
            <input
              type="text"
              className="input-field"
              style={{ fontSize: '1.25rem', fontWeight: 700 }}
              placeholder="Enter a compelling title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Excerpt / Subtitle Input */}
          <div className="input-group">
            <label className="input-label">Short Excerpt / Subtitle</label>
            <input
              type="text"
              className="input-field"
              placeholder="Brief preview or subtitle of your article for feed cards..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Cover Image Selection (URL or File Upload) */}
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Image size={15} /> Cover Image
                </span>
                <label style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}>
                  📁 Upload Image File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Paste Image URL or click Upload File..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
            </div>

            {/* Tags Input */}
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Tag size={15} /> Tags (Comma separated)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="react, technology, nodejs, ai, design, mongodb"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          {/* Cover Image Preview if present */}
          {coverImage && (
            <div style={{ marginTop: '0.5rem', marginBottom: '1rem', maxHeight: '180px', overflow: 'hidden', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <img
                src={coverImage}
                alt="Cover Preview"
                style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Inline Image Helper Callout */}
        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'var(--bg-glass)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)'
          }}
        >
          <Info size={16} color="var(--accent-primary)" />
          <span>
            <strong>Tip for Inline Images:</strong> You can embed images anywhere in your article content using Markdown syntax: <code style={{ color: 'var(--accent-primary)' }}>![Image Description](Image_URL)</code> or clicking the <Image size={13} style={{ verticalAlign: 'middle' }} /> icon in the editor toolbar.
          </span>
        </div>

        {/* Dual-Pane Markdown Editor */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="input-label" style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'block' }}>
            Article Content (Markdown Supported) *
          </label>
          <MarkdownEditor value={content} onChange={setContent} />
        </div>

        {/* Action Controls Bar */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Status Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Publication Status:
            </span>
            <button
              type="button"
              onClick={() => setStatus('published')}
              className={`badge-published ${status === 'published' ? '' : 'btn-secondary'}`}
              style={{ cursor: 'pointer', opacity: status === 'published' ? 1 : 0.4 }}
            >
              Published
            </button>
            <button
              type="button"
              onClick={() => setStatus('draft')}
              className={`badge-draft ${status === 'draft' ? '' : 'btn-secondary'}`}
              style={{ cursor: 'pointer', opacity: status === 'draft' ? 1 : 0.4 }}
            >
              Draft
            </button>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              disabled={saving}
              onClick={(e) => handleSubmit(e, 'draft')}
              className="btn btn-secondary"
            >
              <Save size={16} /> Save as Draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={(e) => handleSubmit(e, 'published')}
              className="btn btn-primary"
            >
              <Send size={16} /> {saving ? 'Saving...' : id ? 'Update Post' : 'Publish Article'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEditPostPage;
