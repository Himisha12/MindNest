import React from 'react';
import { Search, Filter, Sparkles } from 'lucide-react';

const POPULAR_TAGS = ['technology', 'react', 'nodejs', 'design', 'ai', 'career', 'webdev', 'mongodb'];

const SearchFilter = ({ search, setSearch, tag, setTag, sort, setSort }) => {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Search Bar Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Search posts by title, content, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Sort Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="input-field"
            style={{ width: 'auto', padding: '0.65rem 1rem' }}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="latest">Latest First</option>
            <option value="popular">Most Viewed</option>
            <option value="likes">Most Liked</option>
          </select>
        </div>
      </div>

      {/* Tag Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Sparkles size={13} /> Popular Topics:
        </span>
        <button
          type="button"
          onClick={() => setTag('')}
          className={`tag-chip ${!tag ? 'btn-primary' : ''}`}
          style={{ cursor: 'pointer', border: !tag ? 'none' : undefined }}
        >
          All Topics
        </button>
        {POPULAR_TAGS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTag(tag === t ? '' : t)}
            className="tag-chip"
            style={{
              cursor: 'pointer',
              background: tag === t ? 'var(--accent-primary)' : undefined,
              color: tag === t ? '#fff' : undefined
            }}
          >
            #{t}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchFilter;
