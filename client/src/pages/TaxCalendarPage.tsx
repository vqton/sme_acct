import { useState, useEffect } from 'react';
import { Table, Card, Row, Col, Statistic, Tag, Select, App, Alert, Space } from 'antd';
import { CalendarOutlined, WarningOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import { TaxType } from '../types';

const deadlineTypeLabels: Record<string, string> = {
  vat_monthly: 'GTGT tháng',
  vat_quarterly: 'GTGT quý',
  cit_quarterly: 'TNDN tạm tính quý',
  cit_annual: 'TNDN năm',
  pit_monthly: 'TNCN tháng',
  pit_quarterly: 'TNCN quý',
  pit_annual: 'TNCN quyết toán năm',
  license_annual: 'Lệ phí môn bài',
  sct_monthly: 'TTĐB tháng',
};

const deadlineTypeColors: Record<string, string> = {
  vat_monthly: 'blue', vat_quarterly: 'geekblue',
  cit_quarterly: 'purple', cit_annual: 'purple',
  pit_monthly: 'cyan', pit_quarterly: 'cyan', pit_annual: 'cyan',
  license_annual: 'green',
  sct_monthly: 'orange',
};

export default function TaxCalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [filter, setFilter] = useState<string>('all');
  const { message } = App.useApp();
  const companyId = Number(localStorage.getItem('currentCompanyId'));

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    api.getTaxCalendar(companyId, year)
      .then((data) => {
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch((e) => message.error(e.message || 'Không thể tải lịch thuế'))
      .finally(() => setLoading(false));
  }, [companyId, year, message]);

  const filteredEvents = filter === 'all' ? events : filter === 'overdue' ? events.filter((e) => e.isOverdue) : events.filter((e) => e.taxType === Number(filter));

  const overdueCount = events.filter((e) => e.isOverdue).length;
  const upcomingCount = events.filter((e) => !e.isOverdue && e.daysRemaining <= 30).length;

  const columns = [
    { title: 'Hạn nộp', dataIndex: 'deadline', key: 'deadline', width: 110,
      render: (v: string) => v?.split('T')[0],
    },
    { title: 'Loại thuế', dataIndex: 'eventType', key: 'eventType', width: 160,
      render: (v: string) => <Tag color={deadlineTypeColors[v] || 'default'}>{deadlineTypeLabels[v] || v}</Tag>,
    },
    { title: 'Kỳ', dataIndex: 'periodLabel', key: 'periodLabel', width: 100 },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    { title: 'Trạng thái', dataIndex: 'daysRemaining', key: 'daysRemaining', width: 150,
      render: (v: number, record: any) => {
        if (record.isOverdue) return <Tag icon={<WarningOutlined />} color="error">Quá hạn {Math.abs(v)} ngày</Tag>;
        if (v <= 7) return <Tag icon={<ClockCircleOutlined />} color="warning">Còn {v} ngày</Tag>;
        return <Tag icon={<CheckCircleOutlined />} color="success">Còn {v} ngày</Tag>;
      },
    },
  ];

  const yearOptions: { value: number; label: string }[] = [];
  for (let y = year - 2; y <= year + 2; y++) {
    yearOptions.push({ value: y, label: `Năm ${y}` });
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0 }}>Lịch kê khai thuế</h2>
        <Space wrap>
          <Select style={{ width: 120 }} value={year} onChange={setYear} options={yearOptions} />
          <Select
            style={{ width: 180 }}
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'Tất cả' },
              { value: 'overdue', label: 'Quá hạn' },
              { value: String(TaxType.Vat), label: 'GTGT' },
              { value: String(TaxType.Cit), label: 'TNDN' },
              { value: String(TaxType.Pit), label: 'TNCN' },
              { value: String(TaxType.License), label: 'Môn bài' },
            ]}
          />
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Tổng hạn nộp" value={events.length} prefix={<CalendarOutlined />} valueStyle={{ fontSize: 20 }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Sắp đến hạn (30 ngày)" value={upcomingCount} prefix={<ClockCircleOutlined />} valueStyle={{ fontSize: 20, color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="Quá hạn" value={overdueCount} prefix={<WarningOutlined />} valueStyle={{ fontSize: 20, color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      {overdueCount > 0 && (
        <Alert
          message={`Có ${overdueCount} hạn nộp thuế đã quá hạn. Cần xử lý ngay.`}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        dataSource={filteredEvents}
        columns={columns}
        rowKey={(r) => `${r.eventType}-${r.periodLabel}`}
        loading={loading}
        size="small"
        pagination={{ pageSize: 20 }}
        rowClassName={(record) => record.isOverdue ? 'ant-table-row-error' : ''}
      />
    </div>
  );
}
