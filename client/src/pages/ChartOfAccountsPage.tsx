import { useState, useEffect, useCallback, useRef } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, App, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined, SearchOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import { getAccounts, createAccount, updateAccount, deleteAccount, deactivateAccount, reactivateAccount, seedAccounts } from '../services/api';

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
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const companyId = Number(localStorage.getItem('currentCompanyId'));
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchAccounts = useCallback(async (query?: string, category?: number, activeOnly?: string) => {
    if (!companyId) return;
    setLoading(true);
    try {
      const params: any = {};
      if (query) params.query = query;
      if (category !== undefined) params.category = category;
      if (activeOnly === 'active') params.activeOnly = true;
      if (activeOnly === 'inactive') params.activeOnly = false;
      const data = await getAccounts(companyId, query || category !== undefined || activeOnly !== 'all' ? params : undefined);
      setAccounts(Array.isArray(data) ? data : data.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts, companyId]);

  const onSearchChange = (value: string) => {
    setSearchText(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchAccounts(value || undefined, categoryFilter, activeFilter);
    }, 300);
  };

  const onCategoryChange = (value: number | undefined) => {
    setCategoryFilter(value);
    fetchAccounts(searchText || undefined, value, activeFilter);
  };

  const onActiveChange = (value: string) => {
    setActiveFilter(value);
    fetchAccounts(searchText || undefined, categoryFilter, value);
  };

  const handleSeed = async () => {
    try {
      await seedAccounts(companyId);
      await fetchAccounts();
      message.success('Đã tạo hệ thống tài khoản chuẩn');
    } catch (e: any) {
      message.error(e.message || 'Seed failed');
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xóa tài khoản?',
      content: 'Hành động này không thể hoàn tác.',
      onOk: async () => {
        try {
          await deleteAccount(id);
          message.success('Đã xóa');
          fetchAccounts();
        } catch (e: any) {
          message.error(e.message || 'Lỗi');
        }
      },
    });
  };

  const handleToggleActive = async (record: any) => {
    try {
      if (record.isActive) {
        await deactivateAccount(record.id);
        message.success('Đã vô hiệu hóa tài khoản');
      } else {
        await reactivateAccount(record.id);
        message.success('Đã kích hoạt lại tài khoản');
      }
      fetchAccounts();
    } catch (e: any) {
      message.error(e.message || 'Lỗi');
    }
  };

  const columns = [
    { title: 'Số TK', dataIndex: 'accountNumber', key: 'accountNumber', width: 90, fixed: 'left' as const,
      render: (v: string) => <strong>{v}</strong>,
    },
    { title: 'Tên tài khoản', dataIndex: 'name', key: 'name', width: 260 },
    { title: 'Trạng thái', dataIndex: 'isActive', key: 'isActive', width: 100,
      render: (v: boolean) => v
        ? <Tag icon={<CheckCircleOutlined />} color="success">Đang dùng</Tag>
        : <Tag icon={<StopOutlined />} color="error">Ngừng dùng</Tag>,
    },
    { title: 'Loại', dataIndex: 'category', key: 'category', width: 130,
      render: (v: number) => <Tag color={categoryColors[v]}>{categoryLabels[v] || v}</Tag>,
    },
    { title: 'Tính chất', dataIndex: 'nature', key: 'nature', width: 90,
      render: (v: number) => natureLabels[v] || v,
    },
    { title: 'Dư Nợ ĐK', dataIndex: 'openingDebit', key: 'openingDebit', width: 100, align: 'right' as const,
      render: (v: number) => v?.toLocaleString(),
    },
    { title: 'Dư Có ĐK', dataIndex: 'openingCredit', key: 'openingCredit', width: 100, align: 'right' as const,
      render: (v: number) => v?.toLocaleString(),
    },
    { title: 'PS Nợ', dataIndex: 'debitAmount', key: 'debitAmount', width: 100, align: 'right' as const,
      render: (v: number) => v?.toLocaleString(),
    },
    { title: 'PS Có', dataIndex: 'creditAmount', key: 'creditAmount', width: 100, align: 'right' as const,
      render: (v: number) => v?.toLocaleString(),
    },
    { title: '', key: 'actions', width: 120, fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title={record.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}>
            <Button
              type="link"
              size="small"
              icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
              onClick={() => handleToggleActive(record)}
            />
          </Tooltip>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => {
            setEditing(record);
            form.setFieldsValue(record);
            setModalOpen(true);
          }} />
          {!record.isSystem && (
            <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
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

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <Input.Search
          placeholder="Tìm kiếm tài khoản..."
          prefix={<SearchOutlined />}
          allowClear
          onChange={(e) => onSearchChange(e.target.value)}
          onSearch={(v) => fetchAccounts(v || undefined, categoryFilter, activeFilter)}
          style={{ width: 320 }}
        />
        <Select
          placeholder="Loại tài khoản"
          allowClear
          style={{ width: 180 }}
          value={categoryFilter}
          onChange={onCategoryChange}
          options={Object.entries(categoryLabels).map(([v, l]) => ({ value: Number(v), label: l }))}
        />
        <Select
          style={{ width: 140 }}
          value={activeFilter}
          onChange={onActiveChange}
          options={[
            { value: 'all', label: 'Tất cả' },
            { value: 'active', label: 'Đang dùng' },
            { value: 'inactive', label: 'Ngừng dùng' },
          ]}
        />
      </div>

      <Table
        dataSource={accounts}
        columns={columns}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={false}
        scroll={{ x: 1300 }}
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
