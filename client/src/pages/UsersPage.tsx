import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { userApi } from '../services/api';
import type { UserListItem } from '../types';

export default function UsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {};
      if (search) params.query = search;
      if (filterActive !== 'all') params.isActive = filterActive === 'active';
      const res = await userApi.listUsers(params);
      setUsers(res.data);
      setTotal(res.total);
    } catch {
      setError('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [search, filterActive]);

  useEffect(() => { fetch(); }, [fetch]);

  async function handleToggleActive(u: UserListItem) {
    try {
      if (u.isActive) {
        await userApi.deactivateUser(u.id);
      } else {
        await userApi.activateUser(u.id);
      }
      fetch();
    } catch {
      setError('Thao tác thất bại');
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Người dùng</h1>
        <Link to="/users/new" style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#fff', background: '#2563eb', border: 'none', borderRadius: 6, cursor: 'pointer', textDecoration: 'none' }}>
          + Thêm người dùng
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          placeholder="Tìm kiếm tên, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }}
        />
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13 }}
        >
          <option value="all">Tất cả</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã vô hiệu</option>
        </select>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', marginBottom: 16, background: '#fee', border: '1px solid #fcc', borderRadius: 6, color: '#c33', fontSize: 14 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>Đang tải...</div>
      ) : users.length === 0 ? (
        <p style={{ color: '#888' }}>Chưa có người dùng nào.</p>
      ) : (
        <>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Tổng số: {total}</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: 10, color: '#555', fontWeight: 600 }}>Tên đăng nhập</th>
                <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: 10, color: '#555', fontWeight: 600 }}>Họ và tên</th>
                <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: 10, color: '#555', fontWeight: 600 }}>Email</th>
                <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: 10, color: '#555', fontWeight: 600 }}>Chức vụ</th>
                <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: 10, color: '#555', fontWeight: 600 }}>Phòng ban</th>
                <th style={{ textAlign: 'center', borderBottom: '2px solid #ddd', padding: 10, color: '#555', fontWeight: 600 }}>Trạng thái</th>
                <th style={{ textAlign: 'center', borderBottom: '2px solid #ddd', padding: 10, color: '#555', fontWeight: 600 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ transition: 'background 0.1s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: 10, borderBottom: '1px solid #eee', fontWeight: 500 }}>
                    <Link to={`/users/${u.id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{u.username}</Link>
                  </td>
                  <td style={{ padding: 10, borderBottom: '1px solid #eee' }}>{u.fullName}</td>
                  <td style={{ padding: 10, borderBottom: '1px solid #eee', color: '#888' }}>{u.email}</td>
                  <td style={{ padding: 10, borderBottom: '1px solid #eee', color: '#666' }}>{u.position || '—'}</td>
                  <td style={{ padding: 10, borderBottom: '1px solid #eee', color: '#666' }}>{u.department || '—'}</td>
                  <td style={{ padding: 10, borderBottom: '1px solid #eee', textAlign: 'center' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#fff',
                      background: u.isActive ? '#16a34a' : '#dc2626',
                    }}>
                      {u.isActive ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </td>
                  <td style={{ padding: 10, borderBottom: '1px solid #eee', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <Link to={`/users/${u.id}`} style={{ padding: '4px 10px', fontSize: 11, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 4, cursor: 'pointer', textDecoration: 'none' }}>
                        Xem
                      </Link>
                      <Link to={`/users/${u.id}/edit`} style={{ padding: '4px 10px', fontSize: 11, color: '#ca8a04', background: '#fefce8', border: '1px solid #fde68a', borderRadius: 4, cursor: 'pointer', textDecoration: 'none' }}>
                        Sửa
                      </Link>
                      <button onClick={() => handleToggleActive(u)} style={{
                        padding: '4px 10px', fontSize: 11,
                        color: u.isActive ? '#dc2626' : '#16a34a',
                        background: u.isActive ? '#fef2f2' : '#f0fdf4',
                        border: `1px solid ${u.isActive ? '#fecaca' : '#bbf7d0'}`,
                        borderRadius: 4, cursor: 'pointer',
                      }}>
                        {u.isActive ? 'Vô hiệu' : 'Kích hoạt'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
