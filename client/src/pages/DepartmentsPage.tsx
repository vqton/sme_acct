import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Tree, Button, Space, Tag, Modal, Form, Input, Select, App, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Department, DepartmentTreeItem } from '../types';
import { departmentApi } from '../services/api';

const DEPT_TYPE_LABELS: Record<number, string> = {
  1: 'Trung tâm CP',
  2: 'Trung tâm LN',
  3: 'Trung tâm ĐT',
  4: 'Trung tâm HT',
};

const DEPT_TYPE_COLORS: Record<number, string> = {
  1: 'blue', 2: 'green', 3: 'purple', 4: 'orange',
};

const STATUS_LABELS: Record<number, string> = {
  1: 'Đang HĐ',
  2: 'Ngừng HĐ',
  3: 'Giải thể',
};

const STATUS_COLORS: Record<number, string> = {
  1: 'green', 2: 'orange', 3: 'red',
};

function buildTree(depts: Department[]): DepartmentTreeItem[] {
  const map = new Map<number, DepartmentTreeItem>();
  const roots: DepartmentTreeItem[] = [];
  for (const d of depts) {
    map.set(d.id, { ...d, children: [] });
  }
  for (const d of depts) {
    const node = map.get(d.id)!;
    if (d.parentId && map.has(d.parentId)) {
      map.get(d.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function toTreeData(nodes: DepartmentTreeItem[]): any[] {
  return nodes.map((n) => ({
    title: (
      <Link to={`/companies/${n.companyId}/departments/${n.id}`}
        style={{ color: '#1a1a2e', textDecoration: 'none' }}>
        <span style={{ fontWeight: n.depth === 0 ? 600 : 400 }}>{n.code}</span>
        {' — '}{n.name}
        <Tag color={DEPT_TYPE_COLORS[n.departmentType]} style={{ marginLeft: 8, fontSize: 11 }}>
          {DEPT_TYPE_LABELS[n.departmentType]}
        </Tag>
        <Tag color={STATUS_COLORS[n.status]} style={{ fontSize: 11 }}>
          {STATUS_LABELS[n.status]}
        </Tag>
      </Link>
    ),
    key: n.id,
    children: n.children.length > 0 ? toTreeData(n.children) : undefined,
  }));
}

export default function DepartmentsPage() {
  const { companyId: cidStr } = useParams<{ companyId: string }>();
  const cid = cidStr ? Number(cidStr) : Number(localStorage.getItem('currentCompanyId')) || 0;
  const [depts, setDepts] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const fetch = useCallback(async () => {
    if (!cid) return;
    setLoading(true);
    try {
      const data = await departmentApi.list(cid);
      setDepts(data);
    } catch (e: any) {
      message.error(e.message || 'Không thể tải danh sách phòng ban');
    } finally {
      setLoading(false);
    }
  }, [cid, message]);

  useEffect(() => { fetch(); }, [fetch]);

  const tree = buildTree(depts);
  const treeData = toTreeData(tree);

  async function handleDelete(id: number) {
    try {
      await departmentApi.delete(cid, id);
      message.success('Đã xóa');
      fetch();
    } catch (e: any) {
      message.error(e.message || 'Xóa thất bại');
    }
  }

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (dept: Department) => {
    setEditing(dept);
    form.setFieldsValue(dept);
    setModalOpen(true);
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link to={`/companies/${cid}`} style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none' }}>&larr; Công ty</Link>
          <h2 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>Phòng ban</h2>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm phòng ban
        </Button>
      </div>

      {loading ? (
        <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>Đang tải...</div>
      ) : depts.length === 0 ? (
        <p style={{ color: '#888' }}>Chưa có phòng ban nào.</p>
      ) : (
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Tổng số: {depts.length}</div>
            <Tree
              treeData={treeData}
              defaultExpandAll
              showLine
              style={{ background: 'transparent' }}
            />
          </div>

          <div style={{ width: 320, flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Danh sách</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: 8, color: '#555', fontWeight: 600 }}>Mã</th>
                  <th style={{ textAlign: 'left', borderBottom: '2px solid #ddd', padding: 8, color: '#555', fontWeight: 600 }}>Tên</th>
                  <th style={{ textAlign: 'center', borderBottom: '2px solid #ddd', padding: 8, color: '#555', fontWeight: 600 }}>TT</th>
                  <th style={{ textAlign: 'center', borderBottom: '2px solid #ddd', padding: 8, width: 80 }}></th>
                </tr>
              </thead>
              <tbody>
                {depts.map((d) => (
                  <tr key={d.id} style={{ transition: 'background 0.1s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: 8, borderBottom: '1px solid #eee', fontWeight: 500 }}>{d.code}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                      <Link to={`/companies/${cid}/departments/${d.id}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{d.name}</Link>
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center' }}>
                      <Tag color={STATUS_COLORS[d.status]} style={{ fontSize: 11 }}>{STATUS_LABELS[d.status]}</Tag>
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center' }}>
                      <Space size="small">
                        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(d)} />
                        <Popconfirm title="Xóa phòng ban?" onConfirm={() => handleDelete(d.id)} okText="Xóa" cancelText="Hủy">
                          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </Space>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        title={editing ? 'Sửa phòng ban' : 'Thêm phòng ban'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              if (editing) {
                await departmentApi.update(cid, editing.id, values);
                message.success('Đã cập nhật');
              } else {
                await departmentApi.create(cid, values);
                message.success('Đã tạo');
              }
              setModalOpen(false);
              fetch();
            } catch (e: any) {
              message.error(e.message || 'Lỗi');
            }
          }}
        >
          <Form.Item name="code" label="Mã phòng ban" rules={[{ required: true, message: 'Nhập mã phòng ban' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Tên phòng ban" rules={[{ required: true, message: 'Nhập tên phòng ban' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="nameEnglish" label="Tên tiếng Anh">
            <Input />
          </Form.Item>
          <Form.Item name="departmentType" label="Loại phòng ban" initialValue={1}>
            <Select options={Object.entries(DEPT_TYPE_LABELS).map(([v, l]) => ({ value: Number(v), label: l }))} />
          </Form.Item>
          <Form.Item name="parentId" label="Phòng ban cha">
            <Select allowClear placeholder="Chọn phòng ban cha" options={depts.map((d) => ({ value: d.id, label: `${d.code} — ${d.name}` }))} />
          </Form.Item>
          <Form.Item name="managerTitle" label="Chức danh quản lý">
            <Input />
          </Form.Item>
          <Form.Item name="effectiveDate" label="Ngày hiệu lực">
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
