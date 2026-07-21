import { useState, useEffect } from 'react';
import { Table, Select, App } from 'antd';
import { getTrialBalance, getFiscalPeriods } from '../services/api';

export default function TrialBalancePage() {
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>(undefined);
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const companyId = localStorage.getItem('currentCompanyId') || '';

  useEffect(() => {
    if (!companyId) return;
    getFiscalPeriods(companyId).then((data) => {
      setPeriods(data);
    }).catch(() => {});
  }, [companyId]);

  useEffect(() => {
    if (!companyId || !selectedPeriod) return;
    setLoading(true);
    getTrialBalance(companyId, selectedPeriod)
      .then(setBalances)
      .catch((e) => message.error(e.message))
      .finally(() => setLoading(false));
  }, [companyId, selectedPeriod]);

  const totalOpeningDebit = balances.reduce((s, b) => s + b.openingDebit, 0);
  const totalOpeningCredit = balances.reduce((s, b) => s + b.openingCredit, 0);
  const totalPeriodDebit = balances.reduce((s, b) => s + b.periodDebit, 0);
  const totalPeriodCredit = balances.reduce((s, b) => s + b.periodCredit, 0);
  const totalClosingDebit = balances.reduce((s, b) => s + b.closingDebit, 0);
  const totalClosingCredit = balances.reduce((s, b) => s + b.closingCredit, 0);

  const columns = [
    { title: 'Số TK', dataIndex: 'accountNumber', key: 'accountNumber', width: 100 },
    { title: 'Dư Nợ ĐK', dataIndex: 'openingDebit', key: 'openingDebit', width: 130, align: 'right' as const,
      render: (v: number) => v?.toLocaleString(),
    },
    { title: 'Dư Có ĐK', dataIndex: 'openingCredit', key: 'openingCredit', width: 130, align: 'right' as const,
      render: (v: number) => v?.toLocaleString(),
    },
    { title: 'PS Nợ', dataIndex: 'periodDebit', key: 'periodDebit', width: 130, align: 'right' as const,
      render: (v: number) => v?.toLocaleString(),
    },
    { title: 'PS Có', dataIndex: 'periodCredit', key: 'periodCredit', width: 130, align: 'right' as const,
      render: (v: number) => v?.toLocaleString(),
    },
    { title: 'Dư Nợ CK', dataIndex: 'closingDebit', key: 'closingDebit', width: 130, align: 'right' as const,
      render: (v: number) => <strong>{v?.toLocaleString()}</strong>,
    },
    { title: 'Dư Có CK', dataIndex: 'closingCredit', key: 'closingCredit', width: 130, align: 'right' as const,
      render: (v: number) => <strong>{v?.toLocaleString()}</strong>,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Bảng cân đối tài khoản</h2>
        <Select
          style={{ width: 200 }}
          value={selectedPeriod || undefined}
          onChange={setSelectedPeriod}
          options={periods.map((p) => ({ value: p.id, label: p.periodName }))}
          placeholder="Chọn kỳ"
        />
      </div>
      <Table
        dataSource={balances}
        columns={columns}
        rowKey="accountId"
        loading={loading}
        size="small"
        scroll={{ x: 900 }}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}><strong>Tổng cộng</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={1} align="right"><strong>{totalOpeningDebit.toLocaleString()}</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={2} align="right"><strong>{totalOpeningCredit.toLocaleString()}</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={3} align="right"><strong>{totalPeriodDebit.toLocaleString()}</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={4} align="right"><strong>{totalPeriodCredit.toLocaleString()}</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={5} align="right"><strong>{totalClosingDebit.toLocaleString()}</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={6} align="right"><strong>{totalClosingCredit.toLocaleString()}</strong></Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </div>
  );
}
