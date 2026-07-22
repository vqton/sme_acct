import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';

const ROLE_OPTIONS = [
  { value: 'giam-doc', label: 'Giám đốc' },
  { value: 'ke-toan-truong', label: 'Kế toán trưởng' },
  { value: 'ke-toan-tong-hop', label: 'Kế toán tổng hợp' },
  { value: 'ke-toan-thue', label: 'Kế toán thuế' },
  { value: 'ke-toan-cong-no', label: 'Kế toán công nợ' },
  { value: 'ke-toan-kho', label: 'Kế toán kho' },
  { value: 'ke-toan-tien-luong', label: 'Kế toán tiền lương' },
  { value: 'thu-quy', label: 'Thủ quỹ' },
  { value: 'ke-toan-vien', label: 'Kế toán viên' },
  { value: 'kiem-soat', label: 'Kiểm soát viên' },
  { value: 'he-thong', label: 'Quản trị hệ thống' },
];

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  roles: string[];
}

export default function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState<FormData>({
    fullName: '', email: '', phone: '', position: '', department: '', roles: [],
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    userApi.getUser(id).then((u) => {
      setForm({
        fullName: u.fullName,
        email: u.email,
        phone: u.phone || '',
        position: u.position || '',
        department: u.department || '',
        roles: u.roles,
      });
    }).catch(() => setError('Không thể tải thông tin')).finally(() => setLoading(false));
  }, [id]);

  function toggleRole(role: string) {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim()) { setError('Vui lòng nhập họ và tên'); return; }
    if (!form.email.trim()) { setError('Vui lòng nhập email'); return; }

    setSaving(true);
    setError('');

    try {
      if (isEdit && id) {
        await userApi.updateUser(id, {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          position: form.position,
          department: form.department,
        });
        // Sync roles
        const currentRoles = await userApi.getUserRoles(id);
        const currentSet = new Set(currentRoles.roles);
        const newSet = new Set(form.roles);
        for (const r of currentSet) { if (!newSet.has(r)) await userApi.removeRole(id, r); }
        for (const r of newSet) { if (!currentSet.has(r)) await userApi.assignRole(id, r); }
      }
      navigate('/users');
    } catch {
      setError('Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>Đang tải...</div>;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, boxSizing: 'border-box',
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', marginBottom: 20 }}>
        {isEdit ? 'Sửa người dùng' : 'Thêm người dùng'}
      </h1>

      {error && (
        <div style={{ padding: '10px 14px', marginBottom: 16, background: '#fee', border: '1px solid #fcc', borderRadius: 6, color: '#c33', fontSize: 14 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: '#374151' }}>Thông tin cơ bản</h3>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 4 }}>Họ và tên *</label>
            <input style={inputStyle} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 4 }}>Email *</label>
            <input style={inputStyle} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 4 }}>Số điện thoại</label>
            <input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 4 }}>Chức vụ</label>
            <input style={inputStyle} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 4 }}>Phòng ban</label>
            <input style={inputStyle} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: '#374151' }}>Vai trò</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ROLE_OPTIONS.map((r) => (
              <label key={r.value} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                border: `1px solid ${form.roles.includes(r.value) ? '#2563eb' : '#d1d5db'}`,
                borderRadius: 6, cursor: 'pointer', fontSize: 13,
                background: form.roles.includes(r.value) ? '#eff6ff' : '#fff',
              }}>
                <input type="checkbox" checked={form.roles.includes(r.value)} onChange={() => toggleRole(r.value)} style={{ margin: 0 }} />
                {r.label}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled={saving} style={{
            padding: '10px 20px', fontSize: 14, fontWeight: 600, color: '#fff', background: '#2563eb',
            border: 'none', borderRadius: 6, cursor: 'pointer', opacity: saving ? 0.6 : 1,
          }}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
          <button type="button" onClick={() => navigate('/users')} style={{
            padding: '10px 20px', fontSize: 14, color: '#555', background: '#fff',
            border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer',
          }}>
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
