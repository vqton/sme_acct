import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Vui lòng nhập email hợp lệ');
      return;
    }

    setLoading(true);
    try {
      await api.forgotPassword(email.trim().toLowerCase());
      setSuccess(true);
    } catch {
      setError('Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: 400, padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', margin: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#9993;</div>
          <h2 style={{ fontSize: 20, color: '#2563eb', marginBottom: 8 }}>Kiểm tra email của bạn</h2>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
            Nếu tài khoản tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi đến <strong>{email}</strong>.
          </p>
          <Link to="/login" style={{ display: 'inline-block', padding: '10px 24px', fontSize: 14, fontWeight: 600, color: '#fff', background: '#2563eb', border: 'none', borderRadius: 6, textDecoration: 'none' }}>
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', margin: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Quên mật khẩu</h1>
          <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>Nhập email để nhận hướng dẫn đặt lại mật khẩu</p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', marginBottom: 16, background: '#fee', border: '1px solid #fcc', borderRadius: 6, color: '#c33', fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="email" style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4, color: '#333' }}>Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box', opacity: loading ? 0.6 : 1 }}
            />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: 16, fontWeight: 600, color: '#fff', background: loading ? '#94a3b8' : '#2563eb', border: 'none', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Đang gửi...' : 'Gửi hướng dẫn đặt lại'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#666' }}>
          <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
            &larr; Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
