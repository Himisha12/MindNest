import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Sparkles,
  Server,
  Activity,
  Cpu,
  Database,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Layers,
  Code2,
  Download
} from 'lucide-react';

const ShowcasePage = () => {
  const [metrics, setMetrics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum' | 'audit'

  const fetchData = async () => {
    try {
      setLoading(true);
      const [mRes, aRes, cRes] = await Promise.all([
        api.get('/showcase/metrics'),
        api.get('/showcase/audit-logs'),
        api.get('/showcase/curriculum')
      ]);

      setMetrics(mRes.data);
      setAuditLogs(aRes.data);
      setCurriculum(cRes.data.layers || cRes.data.curriculum || []);
    } catch (err) {
      console.error('Showcase data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // refresh telemetry every 10s
    return () => clearInterval(interval);
  }, []);

  const handleExportCSV = () => {
    window.open('/api/showcase/export?format=csv', '_blank');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Hero Header */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 1rem',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--accent-primary)',
            marginBottom: '1rem'
          }}
        >
          <Sparkles size={16} /> Developer Portal & Observability Suite
        </div>

        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.75rem' }}>
          MindNest <span className="text-gradient">System Architecture</span> & Telemetry
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '780px', margin: '0 auto 1.5rem auto' }}>
          Explore MindNest's live system architecture, real-time node memory metrics, security audit trails, database indexing, and technical specifications.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={handleExportCSV} className="btn btn-primary btn-sm">
            <Download size={15} /> Export Articles CSV
          </button>
          <a href="/api/health" target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
            <Activity size={15} /> Live Health API
          </a>
        </div>
      </div>

      {/* Real-time Telemetry Bar */}
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>System Uptime</span>
              <Server size={18} color="var(--accent-primary)" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{metrics.uptimeSeconds}s</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Node.js {metrics.nodeVersion}</span>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Memory Heap (RSS)</span>
              <Cpu size={18} color="#a855f7" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{metrics.memory?.rssMB} MB</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Used: {metrics.memory?.heapUsedMB} MB</span>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Database Engine</span>
              <Database size={18} color="#22c55e" />
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#22c55e' }}>MongoMemoryServer</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mongoose Connected</span>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Recorded Audit Logs</span>
              <ShieldCheck size={18} color="#ec4899" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{metrics.stats?.totalAuditLogs}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Security Trail Logged</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`btn btn-sm ${activeTab === 'curriculum' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Layers size={15} /> System Architecture Layers
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`btn btn-sm ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <ShieldCheck size={15} /> Security Audit Trail ({auditLogs.length})
          </button>
        </div>

        {/* Tab 1: Architecture Layers */}
        {activeTab === 'curriculum' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {curriculum.map((dayItem, index) => (
              <div
                key={index}
                style={{
                  padding: '1.5rem',
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      background: 'var(--accent-gradient)',
                      color: '#fff',
                      padding: '0.25rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 800,
                      fontSize: '0.85rem'
                    }}
                  >
                    LAYER {dayItem.layer || index + 1}
                  </span>
                  <h3 style={{ fontSize: '1.2rem' }}>{dayItem.title}</h3>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                    Capabilities & Concepts:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {dayItem.topics.map((topic, idx) => (
                      <span key={idx} className="tag-chip" style={{ fontSize: '0.75rem' }}>
                        <CheckCircle2 size={12} /> {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    padding: '0.85rem 1rem',
                    background: 'var(--bg-input)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '4px solid var(--accent-primary)',
                    fontSize: '0.9rem'
                  }}
                >
                  <strong style={{ color: 'var(--accent-primary)' }}>Implementation in MindNest:</strong>{' '}
                  {dayItem.implementationInMindNest}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Live Audit Logs */}
        {activeTab === 'audit' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Security Audit Trail (RBAC & Event Logging)</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Refreshes live</span>
            </div>

            {auditLogs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '2rem 0', textAlign: 'center' }}>
                No audit logs recorded yet. Perform actions like register, login, or write a post to trigger audit logs!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {auditLogs.map((log) => {
                  const logTime = new Date(log.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <div
                      key={log._id}
                      style={{
                        padding: '0.85rem 1.25rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        gap: '1rem',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Terminal size={15} color="var(--accent-primary)" />
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
                          [{log.action}]
                        </span>
                        <span>{log.details}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
                        <span>User: {log.username}</span>
                        <span>{logTime}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowcasePage;
