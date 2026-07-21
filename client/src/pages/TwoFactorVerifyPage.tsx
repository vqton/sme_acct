import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function TwoFactorVerifyPage() {
  const [searchParams] = useSearchParams();
  const tempToken = searchParams.get('tempToken') || '';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim() || code.length !== 6) {
      setError('Mã xác thực phải gồm 6 chữ số');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/2fa/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code: code.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Verification failed');
      }

      const data = await res.json();
      // Store tokens and navigate
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mã xác thực không đúng');
    } finally {
      setLoading(false);
    }
  };

  if (!tempToken) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', margin: 16, textAlign: 'center' }}>
          <p style={{ color: '#c33' }}>Phiên xác thực không hợp lệ. Vui lòng đăng nhập lại.</p>
          <a href="/login" style={{ color: '#2563eb', marginTop: 12, display: 'inline-block' }}>Đăng nhập</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', margin: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Xác thực 2 lớp</h1>
          <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>Nhập mã từ ứng dụng authenticator</p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', marginBottom: 16, background: '#fee', border: '1px solid #fcc', borderRadius: 6, color: '#c33', fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="totp" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4, color: '#333' }}>Mã xác thực</label>
            <input
              id="totp"
              type="text"
              maxLength={6}
              placeholder="000000"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              disabled={loading}
              autoFocus
              style={{ width: '100%', padding: '12px', fontSize: 24, letterSpacing: 6, textAlign: 'center', border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box' }}
            />
          </div>

          <button type="submit" disabled={loading || code.length !== 6} style={{ width: '100%', padding: '12px', fontSize: 16, fontWeight: 600, color: '#fff', background: loading ? '#94a3b8' : '#2563eb', border: 'none', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Đang xác minh...' : 'Xác minh'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
          <a href="/login" style={{ color: '#666', textDecoration: 'none' }}>Quay lại đăng nhập</a>
        </div>
      </div>
    </div>
  );
}
