import { useEffect, useState } from 'react';
import { userApi } from '../services/api';
import type { UserGroup } from '../types';

export default function UserGroupsPage() {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editGroup, setEditGroup] = useState<UserGroup | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const fetch = async () => {
    try {
      const res = await userApi.listGroups();
      setGroups(res.data);
    } catch {
      setError('Không thể tải danh sách nhóm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  function openCreate() {
    setEditGroup(null);
    setFormName('');
    setFormDesc('');
    setShowForm(true);
  }

  function openEdit(g: UserGroup) {
    setEditGroup(g);
    setFormName(g.name);
    setFormDesc(g.description || '');
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) return;
    try {
      if (editGroup) {
        await userApi.updateGroup(editGroup.id, { name: formName, description: formDesc });
      } else {
        await userApi.createGroup({ name: formName, description: formDesc });
      }
      setShowForm(false);
      fetch();
    } catch {
      setError('Lưu thất bại');
    }
  }

  async function handleDelete(g: UserGroup) {
    if (!confirm(`Xóa nhóm "${g.name}"?`)) return;
    try {
      await userApi.deleteGroup(g.id);
      fetch();
    } catch {
      setError('Xóa thất bại');
    }
  }

  async function handleToggleActive(g: UserGroup) {
    try {
      await userApi.toggleGroupActive(g.id, !g.isActive);
      fetch();
    } catch {
      setError('Thao tác thất bại');
    }
  }

  if (loading) return <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>Đang tải...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Nhóm người dùng</h1>
        <button onClick={openCreate} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#fff', background: '#2563eb', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          + Thêm nhóm
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', marginBottom: 16, background: '#fee', border: '1px solid #fcc', borderRadius: 6, color: '#c33', fontSize: 14 }}>
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSave} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: '#374151' }}>
            {editGroup ? 'Sửa nhóm' : 'Thêm nhóm'}
          </h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 4 }}>Tên nhóm *</label>
            <input value={formName} onChange={(e) => setFormName(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#555', marginBottom: 4 }}>Mô tả</label>
            <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, boxSizing: 'border-box', minHeight: 60 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={{ padding: '8px 16px', fontSize: 13, color: '#fff', background: '#2563eb', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              Lưu
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 16px', fontSize: 13, color: '#555', background: '#fff', border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer' }}>
              Hủy
            </button>
          </div>
        </form>
      )}

      {groups.length === 0 ? (
        <p style={{ color: '#888' }}>Chưa có nhóm nào.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: 10, color: '#555', fontWeight: 600 }}>Tên nhóm</th>
              <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: 10, color: '#555', fontWeight: 600 }}>Mô tả</th>
              <th style={{ textAlign: 'center', borderBottom: '2px solid #ddd', padding: 10, color: '#555', fontWeight: 600 }}>Trạng thái</th>
              <th style={{ textAlign: 'center', borderBottom: '2px solid #ddd', padding: 10, color: '#555', fontWeight: 600 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.id} style={{ transition: 'background 0.1s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <td style={{ padding: 10, borderBottom: '1px solid #eee', fontWeight: 500 }}>{g.name}</td>
                <td style={{ padding: 10, borderBottom: '1px solid #eee', color: '#666' }}>{g.description || '—'}</td>
                <td style={{ padding: 10, borderBottom: '1px solid #eee', textAlign: 'center' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#fff',
                    background: g.isActive ? '#16a34a' : '#6b7280',
                  }}>
                    {g.isActive ? 'Hoạt động' : 'Vô hiệu'}
                  </span>
                </td>
                <td style={{ padding: 10, borderBottom: '1px solid #eee', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button onClick={() => openEdit(g)} style={{ padding: '4px 10px', fontSize: 11, color: '#ca8a04', background: '#fefce8', border: '1px solid #fde68a', borderRadius: 4, cursor: 'pointer' }}>
                      Sửa
                    </button>
                    <button onClick={() => handleToggleActive(g)} style={{
                      padding: '4px 10px', fontSize: 11,
                      color: g.isActive ? '#6b7280' : '#16a34a',
                      background: g.isActive ? '#f3f4f6' : '#f0fdf4',
                      border: `1px solid ${g.isActive ? '#d1d5db' : '#bbf7d0'}`,
                      borderRadius: 4, cursor: 'pointer',
                    }}>
                      {g.isActive ? 'Vô hiệu' : 'Kích hoạt'}
                    </button>
                    <button onClick={() => handleDelete(g)} style={{ padding: '4px 10px', fontSize: 11, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4, cursor: 'pointer' }}>
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
