import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button, Tag, Popconfirm, Modal, Select, Input, App, Space } from 'antd';
import { EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import type { Department, UserDepartment } from '../types';
import { departmentApi, userApi } from '../services/api';
import type { UserListItem } from '../types';

const DEPT_TYPE_LABELS: Record<number, string> = {
  1: 'Trung tâm chi phí',
  2: 'Trung tâm lợi nhuận',
  3: 'Trung tâm đầu tư',
  4: 'Trung tâm hỗ trợ',
};

const STATUS_LABELS: Record<number, string> = {
  1: 'Đang hoạt động',
  2: 'Ngừng hoạt động',
  3: 'Đã giải thể',
};

const STATUS_COLORS: Record<number, string> = {
  1: 'green', 2: 'orange', 3: 'red',
};

type Tab = 'info' | 'members';

export default function DepartmentDetailPage() {
  const { companyId: cidStr, id: idStr } = useParams<{ companyId: string; id: string }>();
  const cid = cidStr ? Number(cidStr) : Number(localStorage.getItem('currentCompanyId')) || 0;
  const id = idStr ? Number(idStr) : undefined;
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [dept, setDept] = useState<Department | null>(null);
  const [users, setUsers] = useState<UserDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [userList, setUserList] = useState<UserListItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(undefined);
  const [jobTitle, setJobTitle] = useState('');

  useEffect(() => {
    if (!id || !cid) return;
    setLoading(true);
    Promise.all([
      departmentApi.getById(cid, id),
      departmentApi.getDepartmentUsers(cid, id),
    ]).then(([d, u]) => {
      setDept(d);
      setUsers(u);
    }).catch(() => {
      message.error('Không thể tải thông tin phòng ban');
    }).finally(() => setLoading(false));
  }, [cid, id, message]);

  async function handleStatusTransition(action: () => Promise<Department>, successMsg: string) {
    try {
      const updated = await action();
      setDept(updated);
      message.success(successMsg);
    } catch (e: any) {
      message.error(e.message || 'Thao tác thất bại');
    }
  }

  async function handleDelete() {
    if (!dept) return;
    try {
      await departmentApi.delete(cid, dept.id);
      message.success('Đã xóa');
      navigate(`/companies/${cid}/departments`);
    } catch (e: any) {
      message.error(e.message || 'Xóa thất bại');
    }
  }

  async function handleEdit() {
    if (!dept) return;
    try {
      const updated = await departmentApi.update(cid, dept.id, editForm);
      setDept(updated);
      setEditModalOpen(false);
      message.success('Đã cập nhật');
    } catch (e: any) {
      message.error(e.message || 'Cập nhật thất bại');
    }
  }

  async function openAssignModal() {
    try {
      const res = await userApi.listUsers();
      setUserList(res.data);
    } catch {
      setUserList([]);
    }
    setSelectedUserId(undefined);
    setJobTitle('');
    setAssignModalOpen(true);
  }

  async function handleAssign() {
    if (!dept || !selectedUserId || !cid) return;
    try {
      await departmentApi.assignUser(cid, dept.id, { userId: selectedUserId, jobTitle: jobTitle || undefined });
      message.success('Đã phân công');
      setAssignModalOpen(false);
      const updated = await departmentApi.getDepartmentUsers(cid, dept.id);
      setUsers(updated);
    } catch (e: any) {
      message.error(e.message || 'Phân công thất bại');
    }
  }

  async function handleRemoveUser(userId: number) {
    if (!dept || !cid) return;
    try {
      await departmentApi.removeUser(cid, dept.id, userId);
      message.success('Đã xóa khỏi phòng ban');
      const updated = await departmentApi.getDepartmentUsers(cid, dept.id);
      setUsers(updated);
    } catch (e: any) {
      message.error(e.message || 'Xóa thất bại');
    }
  }

  async function handleSetPrimary(userId: number) {
    if (!dept || !cid) return;
    try {
      await departmentApi.setPrimary(cid, dept.id, userId);
      message.success('Đã đặt phòng ban chính');
      const updated = await departmentApi.getDepartmentUsers(cid, dept.id);
      setUsers(updated);
    } catch (e: any) {
      message.error(e.message || 'Thất bại');
    }
  }

  if (loading) return <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>Đang tải...</div>;
  if (!dept) return <div style={{ padding: 24, textAlign: 'center', color: '#c33' }}>Không tìm thấy phòng ban</div>;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'info', label: 'Thông tin' },
    { key: 'members', label: 'Thành viên', count: users.length },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <Link to={`/companies/${cid}/departments`} style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none' }}>&larr; Phòng ban</Link>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: '4px 0 4px' }}>{dept.name}</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Tag color={STATUS_COLORS[dept.status]}>{STATUS_LABELS[dept.status]}</Tag>
            <Tag color={DEPT_TYPE_LABELS[dept.departmentType] ? 'blue' : 'default'}>
              {DEPT_TYPE_LABELS[dept.departmentType] || `Loại ${dept.departmentType}`}
            </Tag>
            <span style={{ fontSize: 13, color: '#888' }}>Mã: {dept.code}</span>
          </div>
        </div>
        <Space>
          <Button icon={<EditOutlined />} onClick={() => { setEditForm({ ...dept }); setEditModalOpen(true); }}>Sửa</Button>
          {dept.status === 1 && (
            <>
              <Button onClick={() => handleStatusTransition(() => departmentApi.deactivate(cid, dept.id), 'Đã ngừng hoạt động')}>
                Ngừng HĐ
              </Button>
              <Button onClick={() => handleStatusTransition(() => departmentApi.dissolve(cid, dept.id), 'Đã giải thể')}>
                Giải thể
              </Button>
            </>
          )}
          {dept.status === 2 && (
            <Button onClick={() => handleStatusTransition(() => departmentApi.reactivate(cid, dept.id), 'Đã kích hoạt lại')}>
              Kích hoạt
            </Button>
          )}
          <Popconfirm title="Xóa phòng ban?" onConfirm={handleDelete} okText="Xóa" cancelText="Hủy">
            <Button danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb', marginBottom: 20 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 18px', fontSize: 13, fontWeight: 500,
              color: activeTab === tab.key ? '#2563eb' : '#666',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === tab.key ? '2px solid #2563eb' : '2px solid transparent',
              marginBottom: -2,
            }}
          >
            {tab.label}{tab.count != null ? ` (${tab.count})` : ''}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
          {[
            ['Mã phòng ban', dept.code],
            ['Tên', dept.name],
            ['Tên tiếng Anh', dept.nameEnglish || '—'],
            ['Loại', DEPT_TYPE_LABELS[dept.departmentType] || `Loại ${dept.departmentType}`],
            ['Trạng thái', STATUS_LABELS[dept.status]],
            ['Đường dẫn', dept.path],
            ['Cấp', String(dept.depth)],
            ['Thứ tự', String(dept.sortOrder)],
            ['Chức danh quản lý', dept.managerTitle || '—'],
            ['Quản lý', dept.managerUserId || '—'],
            ['Phó quản lý', dept.deputyManagerUserId || '—'],
            ['TK lương mặc định', dept.defaultSalaryAccount || '—'],
            ['TK CP mặc định', dept.defaultExpenseAccount || '—'],
            ['Kiểm soát NS', dept.hasBudgetControl ? 'Có' : 'Không'],
            ['Ngưỡng cảnh báo NS', `${dept.budgetAlertThreshold}%`],
            ['Ngày hiệu lực', dept.effectiveDate],
            ['Ngày giải thể', dept.dissolutionDate || '—'],
            ['Ngày tạo', dept.createdAt],
          ].map(([label, value]) => (
            <div key={label} style={{ fontSize: 13 }}>
              <span style={{ color: '#888' }}>{label}:</span>{' '}
              <span style={{ color: '#1a1a2e', fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'members' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
            <Button icon={<TeamOutlined />} onClick={openAssignModal}>Phân công người dùng</Button>
          </div>
          {users.length === 0 ? (
            <p style={{ color: '#888', fontSize: 13 }}>Chưa có thành viên.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: 8, color: '#555', fontWeight: 600 }}>User ID</th>
                  <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: 8, color: '#555', fontWeight: 600 }}>Chức danh</th>
                  <th style={{ textAlign: 'center', borderBottom: '2px solid #ddd', padding: 8, color: '#555', fontWeight: 600 }}>Chính</th>
                  <th style={{ textAlign: 'center', borderBottom: '2px solid #ddd', padding: 8, color: '#555', fontWeight: 600 }}>Trạng thái</th>
                  <th style={{ textAlign: 'center', borderBottom: '2px solid #ddd', padding: 8, width: 160 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.userId}>
                    <td style={{ padding: 8, borderBottom: '1px solid #eee', fontWeight: 500 }}>{u.userId}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{u.jobTitle || '—'}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center' }}>
                      {u.isPrimary ? <Tag color="blue">Chính</Tag> : '—'}
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center' }}>
                      <Tag color={u.isActive ? 'green' : 'red'}>{u.isActive ? 'HĐ' : 'VH'}</Tag>
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center' }}>
                      <Space size="small">
                        {!u.isPrimary && (
                          <Button type="link" size="small" onClick={() => handleSetPrimary(u.userId)}>
                            Đặt chính
                          </Button>
                        )}
                        <Popconfirm title="Xóa khỏi phòng ban?" onConfirm={() => handleRemoveUser(u.userId)} okText="Xóa" cancelText="Hủy">
                          <Button type="link" size="small" danger>Xóa</Button>
                        </Popconfirm>
                      </Space>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Modal title="Sửa phòng ban" open={editModalOpen} onCancel={() => setEditModalOpen(false)} onOk={handleEdit} destroyOnClose width={480}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Mã phòng ban</div>
            <Input value={editForm.code || ''} onChange={(e) => setEditForm({ ...editForm, code: e.target.value })} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Tên phòng ban</div>
            <Input value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Tên tiếng Anh</div>
            <Input value={editForm.nameEnglish || ''} onChange={(e) => setEditForm({ ...editForm, nameEnglish: e.target.value })} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Chức danh quản lý</div>
            <Input value={editForm.managerTitle || ''} onChange={(e) => setEditForm({ ...editForm, managerTitle: e.target.value })} />
          </div>
        </div>
      </Modal>

      <Modal title="Phân công người dùng" open={assignModalOpen} onCancel={() => setAssignModalOpen(false)} onOk={handleAssign} destroyOnClose width={420}>
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Người dùng</div>
            <Select
              style={{ width: '100%' }}
              placeholder="Chọn người dùng"
              value={selectedUserId || undefined}
              onChange={(v) => setSelectedUserId(v)}
              options={userList.map((u) => ({ value: u.id, label: `${u.fullName} (@${u.username})` }))}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Chức danh</div>
            <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Trưởng phòng, Phó phòng..." />
          </div>
        </div>
      </Modal>
    </div>
  );
}
