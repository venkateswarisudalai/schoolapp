import { useEffect, useState } from 'react';
import { ChevronLeft, Send, MessageSquare, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  createConcern,
  getConcernsByParent,
  getConcernsByScope,
  getAllConcerns,
  resolveConcern,
} from '../../services/parentConcernService';
import type { Child, ParentConcern, ParentConcernScope } from '../../types/index';

interface Props {
  onBack: () => void;
  // 'parent' = raise + view own; 'teacher' = triage general; 'admin' = triage admin
  role: 'parent' | 'teacher' | 'admin';
  children?: Child[];
}

const GENERAL_OPTIONS = ['food', 'water', 'other'];
const ADMIN_OPTIONS = ['bonafide', 'fees', 'other'];

const scopeLabel = (s: ParentConcernScope) => s === 'general' ? 'General (Food / Water)' : 'Admin (Bonafide / Fees)';

const ParentConcernBoard = ({ onBack, role, children: childrenProp }: Props) => {
  const { user } = useAuth();
  const [concerns, setConcerns] = useState<ParentConcern[]>([]);
  const [loading, setLoading] = useState(true);

  // Parent-only form state
  const [scope, setScope] = useState<ParentConcernScope>('general');
  const [subcategory, setSubcategory] = useState('food');
  const [message, setMessage] = useState('');
  const [childId, setChildId] = useState<string>(childrenProp?.[0]?.id || '');
  const [saving, setSaving] = useState(false);

  // Staff: resolve form state
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let data: ParentConcern[] = [];
      if (role === 'parent') {
        data = await getConcernsByParent(user.id);
      } else if (role === 'teacher') {
        data = await getConcernsByScope('general');
      } else if (role === 'admin') {
        // Admin oversees everything — show all concerns
        data = await getAllConcerns();
      }
      setConcerns(data);
    } catch (e) {
      console.error('Error loading concerns:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [role, user?.id]);

  const handleScopeChange = (s: ParentConcernScope) => {
    setScope(s);
    setSubcategory(s === 'general' ? 'food' : 'bonafide');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim()) return;
    setSaving(true);
    try {
      const child = childrenProp?.find(c => c.id === childId);
      await createConcern({
        parentId: user.id,
        parentName: user.name,
        childId: child?.id,
        childName: child?.name,
        scope,
        subcategory,
        message: message.trim(),
        status: 'open',
        createdAt: new Date().toISOString(),
      });
      setMessage('');
      await load();
    } catch (e) {
      console.error('Error submitting concern:', e);
      alert('Failed to submit concern');
    } finally {
      setSaving(false);
    }
  };

  const handleResolve = async (id: string) => {
    if (!user || !resolutionText.trim()) return;
    try {
      await resolveConcern(id, resolutionText.trim(), user.name || user.id);
      setResolvingId(null);
      setResolutionText('');
      await load();
    } catch {
      alert('Failed to mark as resolved');
    }
  };

  return (
    <div className="content">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}><ChevronLeft size={24} /></button>
        <h2 className="page-title">Concerns</h2>
      </div>

      {role === 'parent' && (
        <form onSubmit={handleSubmit} style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['general', 'admin'] as ParentConcernScope[]).map(s => (
              <button
                type="button"
                key={s}
                onClick={() => handleScopeChange(s)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  background: scope === s ? '#2563eb' : 'white',
                  color: scope === s ? 'white' : '#334155',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {scopeLabel(s)}
              </button>
            ))}
          </div>

          <label style={{ fontSize: 13, color: '#334155' }}>
            Topic
            <select
              value={subcategory}
              onChange={e => setSubcategory(e.target.value)}
              style={{ display: 'block', width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8, marginTop: 4 }}
            >
              {(scope === 'general' ? GENERAL_OPTIONS : ADMIN_OPTIONS).map(o => (
                <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
              ))}
            </select>
          </label>

          {childrenProp && childrenProp.length > 0 && (
            <label style={{ fontSize: 13, color: '#334155' }}>
              Child
              <select
                value={childId}
                onChange={e => setChildId(e.target.value)}
                style={{ display: 'block', width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8, marginTop: 4 }}
              >
                {childrenProp.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          )}

          <label style={{ fontSize: 13, color: '#334155' }}>
            Message
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              placeholder="Describe your concern…"
              required
              style={{ display: 'block', width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: 8, marginTop: 4, fontFamily: 'inherit' }}
            />
          </label>

          <button
            type="submit"
            disabled={saving || !message.trim()}
            style={{
              background: '#2563eb', color: 'white', border: 'none',
              padding: '12px', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              opacity: saving ? 0.6 : 1,
            }}
          >
            <Send size={16} /> {saving ? 'Submitting…' : 'Submit Concern'}
          </button>
        </form>
      )}

      <div style={{ padding: '8px 16px 24px' }}>
        <h3 style={{ fontSize: 14, color: '#64748b', margin: '12px 0 8px' }}>
          {role === 'parent' ? 'Your concerns' : role === 'teacher' ? 'General concerns' : 'All concerns'}
        </h3>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading…</p>
        ) : concerns.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
            <MessageSquare size={36} style={{ opacity: 0.5, marginBottom: 8 }} />
            <p>No concerns yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {concerns.map(c => (
              <div
                key={c.id}
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderLeft: `4px solid ${c.status === 'resolved' ? '#10b981' : '#f59e0b'}`,
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
                  <span>
                    {role === 'admin' && (
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 6px',
                        marginRight: 6,
                        borderRadius: 4,
                        background: c.scope === 'admin' ? '#ede9fe' : '#dbeafe',
                        color: c.scope === 'admin' ? '#5b21b6' : '#1e40af',
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}>{c.scope}</span>
                    )}
                    {c.subcategory} · {c.childName || '—'}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    {c.status === 'resolved' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {c.status}
                  </span>
                </div>
                <p style={{ margin: '6px 0', fontSize: 14 }}>{c.message}</p>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  {role !== 'parent' && <span>From: {c.parentName} · </span>}
                  {new Date(c.createdAt).toLocaleString()}
                </div>

                {c.status === 'resolved' && c.resolution && (
                  <div style={{ marginTop: 8, padding: 8, background: '#f0fdf4', borderRadius: 6, fontSize: 13 }}>
                    <strong>Resolution:</strong> {c.resolution}
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      by {c.resolvedBy} · {c.resolvedAt ? new Date(c.resolvedAt).toLocaleString() : ''}
                    </div>
                  </div>
                )}

                {role !== 'parent' && c.status === 'open' && (
                  resolvingId === c.id ? (
                    <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                      <input
                        autoFocus
                        value={resolutionText}
                        onChange={e => setResolutionText(e.target.value)}
                        placeholder="Resolution note"
                        style={{ flex: 1, padding: '8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13 }}
                      />
                      <button
                        onClick={() => handleResolve(c.id)}
                        disabled={!resolutionText.trim()}
                        style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setResolvingId(null); setResolutionText(''); }}
                        style={{ background: '#f1f5f9', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setResolvingId(c.id)}
                      style={{
                        marginTop: 8, background: '#eff6ff', color: '#1e40af',
                        border: '1px solid #bfdbfe', padding: '6px 10px',
                        borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Mark as resolved
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentConcernBoard;
