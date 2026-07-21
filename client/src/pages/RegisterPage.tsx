import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) { setError('Vui lòng nhập họ tên'); return; }
    if (!username.trim() || username.trim().length < 3) { setError('Tên đăng nhập phải từ 3 ký tự'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Email không hợp lệ'); return; }
    if (password.length < 8) { setError('Mật khẩu phải từ 8 ký tự'); return; }
    if (!/[A-Z]/.test(password)) { setError('Mật khẩu phải có ít nhất 1 chữ hoa'); return; }
    if (!/[a-z]/.test(password)) { setError('Mật khẩu phải có ít nhất 1 chữ thường'); return; }
    if (!/\d/.test(password)) { setError('Mật khẩu phải có ít nhất 1 chữ số'); return; }
    if (!/[!@#$%^&*(),.?":{}|<>_]/.test(password)) { setError('Mật khẩu phải có ít nhất 1 ký tự đặc biệt'); return; }
    if (password !== confirmPassword) { setError('Mật khẩu xác nhận không khớp'); return; }

    setLoading(true);
    try {
      await api.register({ username: username.trim(), email: email.trim().toLowerCase(), password, fullName: fullName.trim() });
      setSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Đăng ký thất bại';
      if (msg.includes('already taken')) setError('Tên đăng nhập đã tồn tại');
      else if (msg.includes('already in use')) setError('Email đã được sử dụng');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: 400, padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', margin: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#10003;</div>
          <h2 style={{ fontSize: 20, color: '#16a34a', marginBottom: 8 }}>Đăng ký thành công!</h2>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>Vui lòng đăng nhập để sử dụng hệ thống.</p>
          <button onClick={() => navigate('/login')} style={{ padding: '10px 24px', fontSize: 14, fontWeight: 600, color: '#fff', background: '#2563eb', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', margin: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Đăng ký tài khoản</h1>
          <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>Tạo tài khoản mới để sử dụng hệ thống</p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', marginBottom: 16, background: '#fee', border: '1px solid #fcc', borderRadius: 6, color: '#c33', fontSize: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {[
            { id: 'fullName', label: 'Họ và tên', type: 'text', value: fullName, onChange: setFullName, placeholder: 'Nguyễn Văn A', autoComplete: 'name' },
            { id: 'username', label: 'Tên đăng nhập', type: 'text', value: username, onChange: setUsername, placeholder: 'Từ 3 ký tự', autoComplete: 'username' },
            { id: 'email', label: 'Email', type: 'email', value: email, onChange: setEmail, placeholder: 'email@example.com', autoComplete: 'email' },
            { id: 'password', label: 'Mật khẩu', type: 'password', value: password, onChange: setPassword, placeholder: 'Từ 8 ký tự, có chữ hoa, thường, số, ký tự đặc biệt', autoComplete: 'new-password' },
            { id: 'confirmPassword', label: 'Xác nhận mật khẩu', type: 'password', value: confirmPassword, onChange: setConfirmPassword, placeholder: 'Nhập lại mật khẩu', autoComplete: 'new-password' },
          ].map((field) => (
            <div key={field.id} style={{ marginBottom: 14 }}>
              <label htmlFor={field.id} style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 4, color: '#333' }}>{field.label}</label>
              <input
                id={field.id}
                type={field.type}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                disabled={loading}
                style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #ddd', borderRadius: 6, boxSizing: 'border-box', opacity: loading ? 0.6 : 1 }}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: 16, fontWeight: 600, color: '#fff', background: loading ? '#94a3b8' : '#2563eb', border: 'none', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#666' }}>
          Đã có tài khoản?{' '}
          <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
