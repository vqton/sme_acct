import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Tag, Select, Card, Row, Col, Statistic, App, Modal, Form, InputNumber, Typography, Tooltip } from 'antd';
import { PlusOutlined, LockOutlined, UnlockOutlined, CheckCircleOutlined, SafetyOutlined, ExclamationCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import type { TaxPeriod } from '../types';
import { TaxPeriodStatus } from '../types';

const periodStatusLabels: Record<TaxPeriodStatus, string> = {
  [TaxPeriodStatus.Open]: 'Mở',
  [TaxPeriodStatus.Locked]: 'Đã khóa',
  [TaxPeriodStatus.Finalized]: 'Khóa sổ',
  [TaxPeriodStatus.Amended]: 'Điều chỉnh',
};

const periodStatusColors: Record<TaxPeriodStatus, string> = {
  [TaxPeriodStatus.Open]: 'blue',
  [TaxPeriodStatus.Locked]: 'orange',
  [TaxPeriodStatus.Finalized]: 'green',
  [TaxPeriodStatus.Amended]: 'purple',
};

const periodStatusIcons: Record<TaxPeriodStatus, React.ReactNode> = {
  [TaxPeriodStatus.Open]: <SafetyOutlined />,
  [TaxPeriodStatus.Locked]: <LockOutlined />,
  [TaxPeriodStatus.Finalized]: <CheckCircleOutlined />,
  [TaxPeriodStatus.Amended]: <ExclamationCircleOutlined />,
};

export default function TaxPeriodManagementPage() {
  const [periods, setPeriods] = useState<TaxPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [createModal, setCreateModal] = useState(false);
  const [unlockModal, setUnlockModal] = useState<{ open: boolean; period: TaxPeriod | null }>({ open: false, period: null });
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const companyId = Number(localStorage.getItem('currentCompanyId'));

  const fetchPeriods = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const data = await api.getTaxPeriods(companyId, year);
      setPeriods(Array.isArray(data) ? data : []);
    } catch (e: any) {
      message.error(e.message || 'Không thể tải kỳ tính thuế');
    } finally {
      setLoading(false);
    }
  }, [companyId, year, message]);

  useEffect(() => { fetchPeriods(); }, [fetchPeriods]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await api.createTaxPeriods(companyId, values.year, values.type);
      message.success('Đã tạo kỳ tính thuế');
      setCreateModal(false);
      fetchPeriods();
    } catch (e: any) {
      if (e.errorFields) return;
      message.error(e.message || 'Lỗi');
    }
  };

  const handleLock = async (id: number) => {
    Modal.confirm({
      title: 'Khóa kỳ tính thuế?',
      content: 'Sau khi khóa, không thể sửa tờ khai trong kỳ này.',
      onOk: async () => {
        try {
          await api.lockTaxPeriod(id, 0);
          message.success('Đã khóa kỳ');
          fetchPeriods();
        } catch (e: any) { message.error(e.message || 'Lỗi'); }
      },
    });
  };

  const handleFinalize = async (id: number) => {
    Modal.confirm({
      title: 'Khóa sổ kỳ tính thuế?',
      content: 'Hành động này không thể hoàn tác. Chắc chắn khóa sổ?',
      onOk: async () => {
        try {
          await api.finalizeTaxPeriod(id, 0);
          message.success('Đã khóa sổ');
          fetchPeriods();
        } catch (e: any) { message.error(e.message || 'Lỗi'); }
      },
    });
  };

  const handleUnlock = async () => {
    if (!unlockModal.period) return;
    try {
      const reason = unlockModal.period ? '' : '';
      await api.unlockTaxPeriod(unlockModal.period.id, 0, reason || 'Mở khóa');
      message.success('Đã mở khóa kỳ');
      setUnlockModal({ open: false, period: null });
      fetchPeriods();
    } catch (e: any) { message.error(e.message || 'Lỗi'); }
  };

  const yearOptions: { value: number; label: string }[] = [];
  for (let y = year - 2; y <= year + 2; y++) {
    yearOptions.push({ value: y, label: `Năm ${y}` });
  }

  const openCount = periods.filter((p) => p.status === TaxPeriodStatus.Open).length;
  const lockedCount = periods.filter((p) => p.status === TaxPeriodStatus.Locked).length;
  const finalizedCount = periods.filter((p) => p.status === TaxPeriodStatus.Finalized).length;

  const columns = [
    { title: 'Kỳ', dataIndex: 'periodName', key: 'periodName', width: 140,
      render: (v: string) => <Typography.Text strong>{v}</Typography.Text>,
    },
    { title: 'Loại', dataIndex: 'type', key: 'type', width: 90,
      render: (v: string) => <Tag>{v === 'monthly' ? 'Tháng' : v === 'quarterly' ? 'Quý' : 'Năm'}</Tag>,
    },
    { title: 'Từ ngày', dataIndex: 'startDate', key: 'startDate', width: 100,
      render: (v: string) => v?.split('T')[0],
    },
    { title: 'Đến ngày', dataIndex: 'endDate', key: 'endDate', width: 100,
      render: (v: string) => v?.split('T')[0],
    },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 120,
      render: (v: TaxPeriodStatus) => (
        <Tag color={periodStatusColors[v]} icon={periodStatusIcons[v]}>
          {periodStatusLabels[v] || v}
        </Tag>
      ),
    },
    { title: 'PP GTGT', dataIndex: 'vatMethod', key: 'vatMethod', width: 90,
      render: (v: number) => v === 1 ? 'Khấu trừ' : v === 2 ? 'Trực tiếp' : 'GTGT',
    },
    { title: 'TS TNDN', dataIndex: 'citRate', key: 'citRate', width: 80,
      render: (v: number) => `${v}%`,
    },
    {
      title: '', key: 'actions', width: 160, fixed: 'right' as const,
      render: (_: any, record: TaxPeriod) => (
        <Space size="small">
          <Tooltip title="Số tờ khai">
            <Button type="link" size="small" icon={<FileTextOutlined />} onClick={() => window.location.href = `/accounting/tax?periodId=${record.id}`} />
          </Tooltip>
          {record.status === TaxPeriodStatus.Open && (
            <Tooltip title="Khóa kỳ">
              <Button type="link" size="small" icon={<LockOutlined />} onClick={() => handleLock(record.id)} />
            </Tooltip>
          )}
          {record.status === TaxPeriodStatus.Locked && (
            <Tooltip title="Khóa sổ">
              <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handleFinalize(record.id)} />
            </Tooltip>
          )}
          {(record.status === TaxPeriodStatus.Locked || record.status === TaxPeriodStatus.Finalized) && (
            <Tooltip title="Mở khóa">
              <Button type="link" size="small" icon={<UnlockOutlined />} onClick={() => setUnlockModal({ open: true, period: record })} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0 }}>Kỳ tính thuế</h2>
        <Space wrap>
          <Select style={{ width: 120 }} value={year} onChange={setYear} options={yearOptions} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            form.resetFields();
            form.setFieldsValue({ year, type: 'monthly' });
            setCreateModal(true);
          }}>
            Tạo kỳ
          </Button>
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small"><Statistic title="Đang mở" value={openCount} prefix={<SafetyOutlined />} valueStyle={{ fontSize: 20, color: '#1890ff' }} /></Card>
        </Col>
        <Col span={6}>
          <Card size="small"><Statistic title="Đã khóa" value={lockedCount} prefix={<LockOutlined />} valueStyle={{ fontSize: 20, color: '#fa8c16' }} /></Card>
        </Col>
        <Col span={6}>
          <Card size="small"><Statistic title="Khóa sổ" value={finalizedCount} prefix={<CheckCircleOutlined />} valueStyle={{ fontSize: 20, color: '#52c41a' }} /></Card>
        </Col>
        <Col span={6}>
          <Card size="small"><Statistic title="Tổng số" value={periods.length} prefix={<FileTextOutlined />} valueStyle={{ fontSize: 20 }} /></Card>
        </Col>
      </Row>

      <Table
        dataSource={periods}
        columns={columns}
        rowKey="id"
        loading={loading}
        size="small"
        scroll={{ x: 1000 }}
        pagination={false}
      />

      <Modal
        title="Tạo kỳ tính thuế"
        open={createModal}
        onCancel={() => setCreateModal(false)}
        onOk={handleCreate}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="year" label="Năm" rules={[{ required: true }]}>
            <InputNumber min={2020} max={2100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="type" label="Loại kỳ" rules={[{ required: true }]}>
            <Select options={[
              { value: 'monthly', label: 'Theo tháng' },
              { value: 'quarterly', label: 'Theo quý' },
              { value: 'yearly', label: 'Theo năm' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Mở khóa kỳ tính thuế"
        open={unlockModal.open}
        onCancel={() => setUnlockModal({ open: false, period: null })}
        onOk={handleUnlock}
        okText="Mở khóa"
      >
        <Typography.Paragraph>
          Bạn có chắc muốn mở khóa kỳ <strong>{unlockModal.period?.periodName}</strong>?
        </Typography.Paragraph>
        <Typography.Text type="warning">
          Việc này cho phép điều chỉnh tờ khai trong kỳ đã khóa sổ.
        </Typography.Text>
      </Modal>
    </div>
  );
}
