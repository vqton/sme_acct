import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TwoFactorSetupPage() {
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/auth/2fa/setup', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setSecret(data.secret);
        setBackupCodes(data.backupCodes);
        setLoading(false);
      })
      .catch(() => {
        setError('Không thể thiết lập 2FA');
        setLoading(false);
      });
  }, []);

  const handleVerify = async () => {
    setError('');
    if (!code.trim() || code.length !== 6) {
      setError('Mã xác thực phải gồm 6 chữ số');
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ code: code.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Verification failed');
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mã xác thực không đúng');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#666' }}>Đang tải...</div>;
  }

  if (success) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: 440, padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', margin: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#x2705;</div>
          <h2 style={{ fontSize: 20, color: '#16a34a', marginBottom: 8 }}>Xác thực 2 lớp đã được bật</h2>
          <p style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
            Tài khoản của bạn giờ đây được bảo vệ bởi xác thực 2 lớp.
          </p>
          <button onClick={() => navigate('/')} style={{ padding: '10px 24px', fontSize: 14, fontWeight: 600, color: '#fff', background: '#2563eb', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 500, padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', margin: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', textAlign: 'center', marginBottom: 20 }}>Thiết lập xác thực 2 lớp</h1>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 14, color: '#333', marginBottom: 8 }}>Bước 1: Quét mã QR bằng ứng dụng authenticator (Google Authenticator, Authy...)</p>
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Hoặc nhập thủ công khóa bí mật:</p>
            <code style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', letterSpacing: 1, wordBreak: 'break-all' }}>{secret}</code>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 14, color: '#333', marginBottom: 8 }}>Bước 2: Nhập mã xác thực từ ứng dụng</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              disabled={verifying}
              style={{ flex: 1, padding: '10px 12px', fontSize: 18, letterSpacing: 4, textAlign: 'center', border: '1px solid #ddd', borderRadius: 6 }}
            />
            <button
              onClick={handleVerify}
              disabled={verifying || code.length !== 6}
              style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600, color: '#fff', background: verifying ? '#94a3b8' : '#2563eb', border: 'none', borderRadius: 6, cursor: verifying ? 'not-allowed' : 'pointer' }}
            >
              {verifying ? 'Đang xác minh...' : 'Xác minh'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', marginBottom: 16, background: '#fee', border: '1px solid #fcc', borderRadius: 6, color: '#c33', fontSize: 14 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 14, color: '#333', marginBottom: 8 }}>Mã dự phòng (lưu lại, mỗi mã chỉ dùng 1 lần):</p>
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {backupCodes.map((c, i) => (
                <code key={i} style={{ fontSize: 13, color: '#333', padding: '2px 4px' }}>{c}</code>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
