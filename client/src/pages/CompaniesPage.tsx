import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Company } from '../types';

const STATUS_LABELS: Record<number, string> = {
  1: 'Đang hoạt động',
  2: 'Tạm ngừng',
  3: 'Đã giải thể',
  4: 'Phá sản',
  5: 'Đã sáp nhập',
  6: 'Đang chuyển đổi',
};

const STATUS_COLORS: Record<number, string> = {
  1: '#16a34a',
  2: '#ca8a04',
  3: '#dc2626',
  4: '#991b1b',
  5: '#6b7280',
  6: '#2563eb',
};

function fmt(n?: number): string {
  if (n == null) return '—';
  return n.toLocaleString('vi-VN');
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    try {
      const data = await api.getCompanies();
      setCompanies(data);
    } catch {
      setError('Không thể tải danh sách công ty');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function handleDelete(c: Company) {
    if (!confirm(`Xóa công ty "${c.name}"?`)) return;
    try {
      await api.deleteCompany(c.id);
      setCompanies((prev) => prev.filter((x) => x.id !== c.id));
    } catch {
      setError('Không thể xóa công ty');
    }
  }

  if (loading) return <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>Đang tải...</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Công ty</h1>
        <Link to="/companies/new" style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#fff', background: '#2563eb', border: 'none', borderRadius: 6, cursor: 'pointer', textDecoration: 'none' }}>
          + Thêm công ty
        </Link>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', marginBottom: 16, background: '#fee', border: '1px solid #fcc', borderRadius: 6, color: '#c33', fontSize: 14 }}>
          {error}
        </div>
      )}

      {companies.length === 0 ? (
        <p style={{ color: '#888' }}>Chưa có công ty nào.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: 10, color: '#555', fontWeight: 600 }}>Tên công ty</th>
              <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: 10, color: '#555', fontWeight: 600 }}>MST</th>
              <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: 10, color: '#555', fontWeight: 600 }}>Trạng thái</th>
              <th style={{ textAlign: 'right', borderBottom: '2px solid #ddd', padding: 10, color: '#555', fontWeight: 600 }}>Vốn điều lệ</th>
              <th style={{ textAlign: 'center', borderBottom: '2px solid #ddd', padding: 10, color: '#555', fontWeight: 600 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id} style={{ transition: 'background 0.1s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <td style={{ padding: 10, borderBottom: '1px solid #eee', fontWeight: 500 }}>
                  <Link to={`/companies/${c.id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                    {c.name}
                  </Link>
                </td>
                <td style={{ padding: 10, borderBottom: '1px solid #eee', color: '#888' }}>{c.taxCode || '—'}</td>
                <td style={{ padding: 10, borderBottom: '1px solid #eee' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#fff', background: STATUS_COLORS[c.status] || '#6b7280' }}>
                    {STATUS_LABELS[c.status] || `Unknown (${c.status})`}
                  </span>
                </td>
                <td style={{ padding: 10, borderBottom: '1px solid #eee', textAlign: 'right', color: '#1a1a2e' }}>
                  {c.charterCapital ? `${fmt(c.charterCapital)} đ` : '—'}
                </td>
                <td style={{ padding: 10, borderBottom: '1px solid #eee', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <Link to={`/companies/${c.id}`} style={{ padding: '4px 10px', fontSize: 11, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 4, cursor: 'pointer', textDecoration: 'none' }}>
                      Xem
                    </Link>
                    <Link to={`/companies/${c.id}/edit`} style={{ padding: '4px 10px', fontSize: 11, color: '#ca8a04', background: '#fefce8', border: '1px solid #fde68a', borderRadius: 4, cursor: 'pointer', textDecoration: 'none' }}>
                      Sửa
                    </Link>
                    <button onClick={() => handleDelete(c)} style={{ padding: '4px 10px', fontSize: 11, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4, cursor: 'pointer' }}>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
