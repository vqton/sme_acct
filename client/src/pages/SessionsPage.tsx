import { useState, useEffect, useCallback } from 'react';

interface Session {
  id: string;
  ipAddress?: string;
  userAgent?: string;
  deviceName?: string;
  createdAt: string;
  lastUsedAt?: string;
}

function parseDevice(ua?: string): string {
  if (!ua) return 'Không rõ';
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera';
  return ua.slice(0, 40);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/sessions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('Failed to load sessions');
      const data = await res.json();
      setSessions(data.sessions);
    } catch {
      setError('Không thể tải danh sách phiên đăng nhập');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const revokeSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('Failed');
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch {
      setError('Không thể thu hồi phiên');
    }
  };

  const revokeAll = async () => {
    try {
      const res = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('Failed');
      setSessions([]);
    } catch {
      setError('Không thể thu hồi tất cả phiên');
    }
  };

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>Đang tải...</div>;
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Phiên đăng nhập</h1>
        {sessions.length > 1 && (
          <button
            onClick={revokeAll}
            style={{ padding: '8px 16px', fontSize: 13, fontWeight: 500, color: '#fff', background: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            Thu hồi tất cả
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: '10px 14px', marginBottom: 16, background: '#fee', border: '1px solid #fcc', borderRadius: 6, color: '#c33', fontSize: 14 }}>
          {error}
        </div>
      )}

      {sessions.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center' }}>Không có phiên nào đang hoạt động.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sessions.map((session) => (
            <div
              key={session.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e' }}>
                  {parseDevice(session.userAgent)}
                  {session.ipAddress && <span style={{ fontWeight: 400, color: '#888', marginLeft: 8 }}>({session.ipAddress})</span>}
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                  Đăng nhập {timeAgo(session.createdAt)}
                  {session.lastUsedAt && ` · Hoạt động gần nhất ${timeAgo(session.lastUsedAt)}`}
                </div>
              </div>
              <button
                onClick={() => revokeSession(session.id)}
                style={{ padding: '6px 12px', fontSize: 12, fontWeight: 500, color: '#dc2626', background: '#fff', border: '1px solid #fecaca', borderRadius: 4, cursor: 'pointer' }}
              >
                Thu hồi
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
