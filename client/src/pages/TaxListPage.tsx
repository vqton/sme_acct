import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Tag, Select, Card, Row, Col, Statistic, App, Modal, Typography, Tabs, Tooltip } from 'antd';
import {
  SafetyOutlined, CalendarOutlined, AuditOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined,
  FileTextOutlined, HistoryOutlined, SendOutlined, EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { TaxDeclaration, TaxPeriod } from '../types';
import { DeclarationStatus, TaxPeriodStatus, TaxType } from '../types';

const taxTypeLabels: Record<TaxType, string> = {
  [TaxType.Vat]: 'GTGT',
  [TaxType.Cit]: 'TNDN',
  [TaxType.Pit]: 'TNCN',
  [TaxType.License]: 'Môn bài',
  [TaxType.Sct]: 'TTĐB',
  [TaxType.ResourceTax]: 'TN tài nguyên',
  [TaxType.EnvironmentalTax]: 'BV môi trường',
  [TaxType.Fct]: 'FCT',
};

const taxTypeColors: Record<TaxType, string> = {
  [TaxType.Vat]: 'blue',
  [TaxType.Cit]: 'purple',
  [TaxType.Pit]: 'cyan',
  [TaxType.License]: 'green',
  [TaxType.Sct]: 'orange',
  [TaxType.ResourceTax]: 'gold',
  [TaxType.EnvironmentalTax]: 'lime',
  [TaxType.Fct]: 'geekblue',
};

const statusLabels: Record<DeclarationStatus, string> = {
  [DeclarationStatus.Draft]: 'Nháp',
  [DeclarationStatus.Submitted]: 'Đã nộp',
  [DeclarationStatus.Adjusted]: 'Đã điều chỉnh',
  [DeclarationStatus.Cancelled]: 'Hủy',
};

const statusColors: Record<DeclarationStatus, string> = {
  [DeclarationStatus.Draft]: 'default',
  [DeclarationStatus.Submitted]: 'success',
  [DeclarationStatus.Adjusted]: 'warning',
  [DeclarationStatus.Cancelled]: 'error',
};

const periodStatusLabels: Record<TaxPeriodStatus, string> = {
  [TaxPeriodStatus.Open]: 'Mở',
  [TaxPeriodStatus.Locked]: 'Khóa',
  [TaxPeriodStatus.Finalized]: 'Khóa sổ',
  [TaxPeriodStatus.Amended]: 'Điều chỉnh',
};

const periodStatusColors: Record<TaxPeriodStatus, string> = {
  [TaxPeriodStatus.Open]: 'blue',
  [TaxPeriodStatus.Locked]: 'orange',
  [TaxPeriodStatus.Finalized]: 'green',
  [TaxPeriodStatus.Amended]: 'purple',
};

export default function TaxListPage() {
  const [declarations, setDeclarations] = useState<TaxDeclaration[]>([]);
  const [periods, setPeriods] = useState<TaxPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number | undefined>();
  const [currentPeriod, setCurrentPeriod] = useState<TaxPeriod | undefined>();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [auditModal, setAuditModal] = useState<{ open: boolean; declId: number; entries: any[] }>({ open: false, declId: 0, entries: [] });
  const { message } = App.useApp();
  const navigate = useNavigate();
  const companyId = Number(localStorage.getItem('currentCompanyId'));

  useEffect(() => {
    if (!companyId) return;
    api.getTaxPeriods(companyId).then((data) => {
      setPeriods(data);
      const open = data.find((p: TaxPeriod) => p.status === TaxPeriodStatus.Open);
      if (open) {
        setSelectedPeriod(open.id);
        setCurrentPeriod(open);
      }
    }).catch(() => {});
  }, [companyId]);

  const fetchDeclarations = useCallback(async (periodId?: number) => {
    if (!companyId) return;
    setLoading(true);
    try {
      const data = await api.listTaxDeclarations(companyId, periodId);
      setDeclarations(Array.isArray(data) ? data : []);
    } catch (e: any) {
      message.error(e.message || 'Không thể tải tờ khai');
    } finally {
      setLoading(false);
    }
  }, [companyId, message]);

  useEffect(() => { fetchDeclarations(selectedPeriod); }, [fetchDeclarations, selectedPeriod]);

  const onPeriodChange = (id: number | undefined) => {
    setSelectedPeriod(id);
    const p = periods.find((x) => x.id === id);
    if (p) setCurrentPeriod(p);
  };

  const handleCreateDeclaration = (taxType: TaxType) => {
    if (!selectedPeriod) {
      message.warning('Chọn kỳ tính thuế trước');
      return;
    }
    navigate(`/accounting/tax/new?periodId=${selectedPeriod}&taxType=${taxType}`);
  };

  const handleSubmit = async (id: number) => {
    Modal.confirm({
      title: 'Nộp tờ khai?',
      content: 'Sau khi nộp sẽ không thể sửa. Xác nhận?',
      onOk: async () => {
        try {
          await api.submitTaxDeclaration(id);
          message.success('Đã nộp tờ khai');
          fetchDeclarations(selectedPeriod);
        } catch (e: any) {
          message.error(e.message || 'Lỗi');
        }
      },
    });
  };

  const handleViewAudit = async (declId: number) => {
    try {
      const entries = await api.getDeclarationAudit(declId);
      setAuditModal({ open: true, declId, entries });
    } catch { setAuditModal({ open: true, declId, entries: [] }); }
  };

  const filteredDecls = activeTab === 'all'
    ? declarations
    : declarations.filter((d) => d.status === Number(activeTab));

  const draftCount = declarations.filter((d) => d.status === DeclarationStatus.Draft).length;
  const submittedCount = declarations.filter((d) => d.status === DeclarationStatus.Submitted).length;

  const columns = [
    { title: 'Số tờ khai', dataIndex: 'declarationNumber', key: 'declarationNumber', width: 130,
      render: (v: string) => <Typography.Text code>{v}</Typography.Text>,
    },
    { title: 'Loại thuế', dataIndex: 'taxType', key: 'taxType', width: 110,
      render: (v: TaxType) => <Tag color={taxTypeColors[v]}>{taxTypeLabels[v] || v}</Tag>,
    },
    { title: 'Kỳ', dataIndex: 'periodName', key: 'periodName', width: 100 },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 110,
      render: (v: DeclarationStatus) => (
        <Tag color={statusColors[v]} icon={v === DeclarationStatus.Draft ? <ClockCircleOutlined /> : v === DeclarationStatus.Submitted ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}>
          {statusLabels[v] || v}
        </Tag>
      ),
    },
    { title: 'Ngày lập', dataIndex: 'declarationDate', key: 'declarationDate', width: 100,
      render: (v: string) => v?.split('T')[0],
    },
    { title: 'Ngày nộp', dataIndex: 'submittedAt', key: 'submittedAt', width: 100,
      render: (v: string) => v ? v.split('T')[0] : '-',
    },
    { title: 'Thuế phải nộp', dataIndex: 'totalDue', key: 'totalDue', width: 130, align: 'right' as const,
      render: (v: number) => v?.toLocaleString(),
    },
    {
      title: '', key: 'actions', width: 150, fixed: 'right' as const,
      render: (_: any, record: TaxDeclaration) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/accounting/tax/${record.id}`)} />
          </Tooltip>
          {record.status === DeclarationStatus.Draft && (
            <Tooltip title="Nộp tờ khai">
              <Button type="link" size="small" icon={<SendOutlined />} onClick={() => handleSubmit(record.id)} />
            </Tooltip>
          )}
          <Tooltip title="Lịch sử thay đổi">
            <Button type="link" size="small" icon={<HistoryOutlined />} onClick={() => handleViewAudit(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0 }}>Kê khai thuế</h2>
        <Space wrap>
          <Button icon={<CalendarOutlined />} onClick={() => navigate('/accounting/tax/calendar')}>
            Lịch thuế
          </Button>
          <Button icon={<AuditOutlined />} onClick={() => navigate('/accounting/tax/periods')}>
            Kỳ tính thuế
          </Button>
          <Select
            style={{ width: 200 }}
            value={selectedPeriod}
            onChange={onPeriodChange}
            placeholder="Chọn kỳ"
            options={periods.map((p) => ({
              value: p.id,
              label: `${p.periodName} - ${periodStatusLabels[p.status as TaxPeriodStatus] || p.status}`,
            }))}
          />
          <Select
            placeholder="Loại tờ khai"
            style={{ width: 160 }}
            onChange={(v: TaxType) => handleCreateDeclaration(v)}
            options={[
              { value: TaxType.Vat, label: 'Tờ khai GTGT' },
              { value: TaxType.Cit, label: 'Tờ khai TNDN' },
              { value: TaxType.Pit, label: 'Tờ khai TNCN' },
              { value: TaxType.Sct, label: 'Tờ khai TTĐB' },
            ]}
          />
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Kỳ hiện tại"
              value={currentPeriod?.periodName || '--'}
              prefix={<SafetyOutlined />}
              valueStyle={{ fontSize: 16 }}
            />
            {currentPeriod && (
              <Tag color={periodStatusColors[currentPeriod.status as TaxPeriodStatus]} style={{ marginTop: 4 }}>
                {periodStatusLabels[currentPeriod.status as TaxPeriodStatus]}
              </Tag>
            )}
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Tờ khai nháp" value={draftCount} prefix={<FileTextOutlined />} valueStyle={{ fontSize: 20, color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Đã nộp" value={submittedCount} prefix={<CheckCircleOutlined />} valueStyle={{ fontSize: 20, color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Tổng số" value={declarations.length} prefix={<FileTextOutlined />} valueStyle={{ fontSize: 20 }} />
          </Card>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        { key: 'all', label: 'Tất cả' },
        { key: String(DeclarationStatus.Draft), label: 'Nháp' },
        { key: String(DeclarationStatus.Submitted), label: 'Đã nộp' },
        { key: String(DeclarationStatus.Adjusted), label: 'Đã điều chỉnh' },
      ]} />

      <Table
        dataSource={filteredDecls}
        columns={columns}
        rowKey="id"
        loading={loading}
        size="small"
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 20, showSizeChanger: true }}
      />

      <Modal
        title="Lịch sử thay đổi tờ khai"
        open={auditModal.open}
        onCancel={() => setAuditModal({ ...auditModal, open: false })}
        footer={null}
        width={600}
      >
        {auditModal.entries.length === 0 ? (
          <Typography.Text type="secondary">Chưa có thay đổi nào</Typography.Text>
        ) : (
          auditModal.entries.map((e: any, i: number) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
              <Space>
                <Tag color={statusColors[e.fromStatus as DeclarationStatus]}>{statusLabels[e.fromStatus as DeclarationStatus]}</Tag>
                <span>→</span>
                <Tag color={statusColors[e.toStatus as DeclarationStatus]}>{statusLabels[e.toStatus as DeclarationStatus]}</Tag>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>{e.changedAt?.split('T')[0]}</Typography.Text>
              </Space>
              {e.comment && <div style={{ marginTop: 4 }}>{e.comment}</div>}
            </div>
          ))
        )}
      </Modal>
    </div>
  );
}
