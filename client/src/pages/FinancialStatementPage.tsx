import { useState, useEffect } from 'react';
import { Table, Select, Space, Tabs, Card, App } from 'antd';
import { getFiscalPeriods, getBalanceSheet, getIncomeStatement } from '../services/api';

export default function FinancialStatementPage() {
  const [periods, setPeriods] = useState<any[]>([]);
  const [periodId, setPeriodId] = useState<number>();
  const [bs, setBs] = useState<any>(null);
  const [is, setIs] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const companyId = Number(localStorage.getItem('currentCompanyId'));

  useEffect(() => {
    if (!companyId) return;
    getFiscalPeriods(companyId).then(setPeriods).catch(() => {});
  }, [companyId]);

  const load = (type: 'bs' | 'is') => {
    if (!companyId || !periodId) return;
    setLoading(true);
    const fn = type === 'bs' ? getBalanceSheet : getIncomeStatement;
    fn(companyId, periodId)
      .then((data: any) => type === 'bs' ? setBs(data) : setIs(data))
      .catch((e: any) => message.error(e.message))
      .finally(() => setLoading(false));
  };

  const renderLines = (lines: any[], level = 0): any[] =>
    lines.flatMap((l: any) => [
      {
        key: l.code,
        code: l.code,
        name: l.name,
        currentPeriod: l.currentPeriod,
        previousPeriod: l.previousPeriod,
        isBold: l.isBold,
        indent: level,
      },
      ...(l.children ? renderLines(l.children, level + 1) : []),
    ]);

  const columns = [
    { title: 'Mã', dataIndex: 'code', key: 'code', width: 60 },
    {
      title: 'Chỉ tiêu', dataIndex: 'name', key: 'name', ellipsis: true,
      render: (v: string, r: any) => (
        <span style={{ fontWeight: r.isBold ? 600 : 400, paddingLeft: r.indent * 16 }}>{v}</span>
      ),
    },
    {
      title: 'Kỳ này', dataIndex: 'currentPeriod', key: 'currentPeriod', width: 150, align: 'right' as const,
      render: (v: number) => v?.toLocaleString(),
    },
    {
      title: 'Kỳ trước', dataIndex: 'previousPeriod', key: 'previousPeriod', width: 150, align: 'right' as const,
      render: (v: number) => v?.toLocaleString(),
    },
  ];

  return (
    <div>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="Chọn kỳ"
            style={{ width: 200 }}
            value={periodId}
            onChange={setPeriodId}
            options={periods.map((p: any) => ({ value: p.id, label: p.periodName }))}
          />
          {periodId && (
            <Space>
              <span>B01-DN:</span>
              <span style={{ color: bs ? '#52c41a' : '#999' }}>{bs ? 'Đã tải' : 'Chưa tải'}</span>
              <span>B02-DN:</span>
              <span style={{ color: is ? '#52c41a' : '#999' }}>{is ? 'Đã tải' : 'Chưa tải'}</span>
            </Space>
          )}
        </Space>

        <Tabs
          items={[
            {
              key: 'bs', label: 'B01-DN (Bảng cân đối kế toán)',
              children: (
                <div>
                  {periodId && !bs && <a onClick={() => load('bs')}>Tải báo cáo</a>}
                  {bs && (
                    <>
                      <h3>{bs.companyName} - {bs.periodLabel}</h3>
                      <Table
                        dataSource={renderLines(bs.lines)}
                        columns={columns}
                        pagination={false}
                        size="small"
                        loading={loading}
                        bordered
                      />
                    </>
                  )}
                </div>
              ),
            },
            {
              key: 'is', label: 'B02-DN (Kết quả hoạt động KD)',
              children: (
                <div>
                  {periodId && !is && <a onClick={() => load('is')}>Tải báo cáo</a>}
                  {is && (
                    <>
                      <h3>{is.companyName} - {is.periodLabel}</h3>
                      <Table
                        dataSource={renderLines(is.lines)}
                        columns={columns}
                        pagination={false}
                        size="small"
                        loading={loading}
                        bordered
                      />
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
