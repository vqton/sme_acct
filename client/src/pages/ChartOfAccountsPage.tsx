import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined } from '@ant-design/icons';
import { getAccounts, createAccount, updateAccount, deleteAccount, seedAccounts } from '../services/api';

const categoryLabels: Record<number, string> = {
  1: 'Tài sản', 2: 'Nợ phải trả', 3: 'Vốn chủ sở hữu',
  4: 'Doanh thu', 5: 'Chi phí', 6: 'Xác định KQKD',
};

const categoryColors: Record<number, string> = {
  1: 'blue', 2: 'orange', 3: 'green', 4: 'cyan', 5: 'red', 6: 'purple',
};

const natureLabels: Record<number, string> = { 1: 'Dư Nợ', 2: 'Dư Có', 3: 'Lưỡng tính' };

export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const companyId = localStorage.getItem('currentCompanyId') || '';

  const fetchAccounts = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const data = await getAccounts(companyId);
      setAccounts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, [companyId]);

  const handleSeed = async () => {
    try {
      await seedAccounts(companyId);
      await fetchAccounts();
      message.success('Đã tạo hệ thống tài khoản chuẩn');
    } catch (e: any) {
      message.error(e.message || 'Seed failed');
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xóa tài khoản?',
      content: 'Hành động này không thể hoàn tác.',
      onOk: async () => {
        await deleteAccount(id);
        message.success('Đã xóa');
        fetchAccounts();
      },
    });
  };

  const columns = [
    { title: 'Số TK', dataIndex: 'accountNumber', key: 'accountNumber', width: 100, fixed: 'left' as const,
      render: (v: string) => <strong>{v}</strong>,
    },
    { title: 'Tên tài khoản', dataIndex: 'name', key: 'name', width: 300 },
    { title: 'Loại', dataIndex: 'category', key: 'category', width: 150,
      render: (v: number) => <Tag color={categoryColors[v]}>{categoryLabels[v] || v}</Tag>,
    },
    { title: 'Tính chất', dataIndex: 'nature', key: 'nature', width: 100,
      render: (v: number) => natureLabels[v] || v,
    },
    { title: 'Dư Nợ ĐK', dataIndex: 'openingDebit', key: 'openingDebit', width: 120, align: 'right' as const,
      render: (v: number) => v?.toLocaleString(),
    },
    { title: 'Dư Có ĐK', dataIndex: 'openingCredit', key: 'openingCredit', width: 120, align: 'right' as const,
      render: (v: number) => v?.toLocaleString(),
    },
    { title: 'PS Nợ', dataIndex: 'debitAmount', key: 'debitAmount', width: 120, align: 'right' as const,
      render: (v: number) => v?.toLocaleString(),
    },
    { title: 'PS Có', dataIndex: 'creditAmount', key: 'creditAmount', width: 120, align: 'right' as const,
      render: (v: number) => v?.toLocaleString(),
    },
    { title: '', key: 'actions', width: 100, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => {
            setEditing(record);
            form.setFieldsValue(record);
            setModalOpen(true);
          }} />
          {!record.isSystem && (
            <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Hệ thống tài khoản kế toán</h2>
        <Space>
          <Button icon={<ApartmentOutlined />} onClick={handleSeed} loading={loading}>
            Tạo tài khoản chuẩn
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            setEditing(null);
            form.resetFields();
            setModalOpen(true);
          }}>
            Thêm tài khoản
          </Button>
        </Space>
      </div>

      <Table
        dataSource={accounts}
        columns={columns}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={false}
        scroll={{ x: 1200 }}
        expandable={{
          defaultExpandAllRows: false,
          rowExpandable: (r) => !!r.parentId,
        }}
      />

      <Modal
        title={editing ? 'Sửa tài khoản' : 'Thêm tài khoản'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              const payload = { ...values, companyId };
              if (editing) {
                await updateAccount(editing.id, payload);
              } else {
                await createAccount(payload);
              }
              message.success(editing ? 'Đã cập nhật' : 'Đã tạo');
              setModalOpen(false);
              fetchAccounts();
            } catch (e: any) {
              message.error(e.message || 'Lỗi');
            }
          }}
        >
          <Form.Item name="accountNumber" label="Số tài khoản" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="Tên tài khoản" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Loại" rules={[{ required: true }]}>
            <Select options={Object.entries(categoryLabels).map(([v, l]) => ({ value: Number(v), label: l }))} />
          </Form.Item>
          <Form.Item name="nature" label="Tính chất" rules={[{ required: true }]}>
            <Select options={Object.entries(natureLabels).map(([v, l]) => ({ value: Number(v), label: l }))} />
          </Form.Item>
          <Form.Item name="description" label="Diễn giải">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
