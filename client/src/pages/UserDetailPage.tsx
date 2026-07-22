import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { userApi } from '../services/api';
import type { UserListItem, UserGroup } from '../types';

const ROLE_LABELS: Record<string, string> = {
  'he-thong': 'Quản trị hệ thống',
  'giam-doc': 'Giám đốc',
  'ke-toan-truong': 'Kế toán trưởng',
  'ke-toan-tong-hop': 'Kế toán tổng hợp',
  'ke-toan-thue': 'Kế toán thuế',
  'ke-toan-cong-no': 'Kế toán công nợ',
  'ke-toan-kho': 'Kế toán kho',
  'ke-toan-tien-luong': 'Kế toán tiền lương',
  'thu-quy': 'Thủ quỹ',
  'ke-toan-vien': 'Kế toán viên',
  'kiem-soat': 'Kiểm soát viên',
};

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserListItem | null>(null);
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      userApi.getUser(id),
      userApi.getUserGroups(id),
    ]).then(([u, g]) => {
      setUser(u);
      setGroups(g.data);
    }).catch(() => {
      setError('Không thể tải thông tin người dùng');
    }).finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!user || !confirm(`Xóa người dùng "${user.fullName}"?`)) return;
    try {
      await userApi.deleteUser(user.id);
      navigate('/users');
    } catch {
      setError('Không thể xóa người dùng');
    }
  }

  if (loading) return <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>Đang tải...</div>;
  if (error) return <div style={{ padding: 24, color: '#c33' }}>{error}</div>;
  if (!user) return <div style={{ padding: 24, color: '#888' }}>Không tìm thấy người dùng</div>;

  const Field = ({ label, value }: { label: string; value: string }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, color: '#1a1a2e' }}>{value}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{user.fullName}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/users/${user.id}/edit`} style={{ padding: '8px 16px', fontSize: 13, color: '#fff', background: '#2563eb', border: 'none', borderRadius: 6, textDecoration: 'none' }}>
            Sửa
          </Link>
          <button onClick={handleDelete} style={{ padding: '8px 16px', fontSize: 13, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer' }}>
            Xóa
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: '#374151' }}>Thông tin tài khoản</h3>
          <Field label="Tên đăng nhập" value={user.username} />
          <Field label="Email" value={user.email} />
          <Field label="Trạng thái" value={user.isActive ? 'Đang hoạt động' : 'Đã vô hiệu hóa'} />
          <Field label="Xác thực 2 lớp" value={user.twoFactorEnabled ? 'Đã bật' : 'Chưa bật'} />
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: '#374151' }}>Thông tin nhân sự</h3>
          <Field label="Chức vụ" value={user.position || '—'} />
          <Field label="Phòng ban" value={user.department || '—'} />
          <Field label="Số điện thoại" value={user.phone || '—'} />
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: '#374151' }}>Vai trò</h3>
          {user.roles.length === 0 ? (
            <p style={{ color: '#888', fontSize: 13 }}>Chưa được phân vai trò</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {user.roles.map((r) => (
                <span key={r} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  {ROLE_LABELS[r] || r}
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: '#374151' }}>Nhóm</h3>
          {groups.length === 0 ? (
            <p style={{ color: '#888', fontSize: 13 }}>Chưa thuộc nhóm nào</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {groups.map((g) => (
                <span key={g.id} style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#6b7280', background: '#f3f4f6' }}>
                  {g.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
