import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Vui lòng nhập tên đăng nhập');
      return;
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }

    setLoading(true);
    try {
      const result = await login(username.trim(), password);
      if (result.requires2FA) {
        navigate(`/2fa/verify?tempToken=${result.tempToken}`);
        return;
      }
      if (result.requiresCompanySelection) {
        return;
      }
      navigate('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      if (msg.includes('locked')) {
        setError('Tài khoản bị khóa do nhập sai quá nhiều lần. Vui lòng thử lại sau.');
      } else if (msg.includes('disabled')) {
        setError('Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.');
      } else if (msg.includes('Too many')) {
        setError('Quá nhiều lần thử. Vui lòng thử lại sau.');
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        padding: 32,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        margin: 16,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
            SME Accounting
          </h1>
          <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
            Hệ thống kế toán doanh nghiệp vừa và nhỏ
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            marginBottom: 16,
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: 6,
            color: '#c33',
            fontSize: 14,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="username" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4, color: '#333' }}>
              Tên đăng nhập
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 14,
                border: '1px solid #ddd',
                borderRadius: 6,
                boxSizing: 'border-box',
                opacity: loading ? 0.6 : 1,
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label htmlFor="password" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4, color: '#333' }}>
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 14,
                border: '1px solid #ddd',
                borderRadius: 6,
                boxSizing: 'border-box',
                opacity: loading ? 0.6 : 1,
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: 14, color: '#555', cursor: 'pointer' }}>
              <input type="checkbox" style={{ marginRight: 6 }} />
              Ghi nhớ đăng nhập
            </label>
            <Link
              to="/forgot-password"
              style={{ fontSize: 14, color: '#2563eb', textDecoration: 'none' }}
            >
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: 16,
              fontWeight: 600,
              color: '#fff',
              background: loading ? '#94a3b8' : '#2563eb',
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#666' }}>
          Chưa có tài khoản?{' '}
          <Link to="/register" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
}
