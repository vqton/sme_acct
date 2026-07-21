import { useState, useEffect } from 'react';
import { Table, Select, Space, App } from 'antd';
import { getAccounts, getLedger, getFiscalPeriods } from '../services/api';

export default function LedgerPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | undefined>(undefined);
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>(undefined);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const companyId = localStorage.getItem('currentCompanyId') || '';

  useEffect(() => {
    if (!companyId) return;
    getAccounts(companyId).then(setAccounts).catch(() => {});
    getFiscalPeriods(companyId).then(setPeriods).catch(() => {});
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return;
    setLoading(true);
    getLedger(companyId, selectedAccount, selectedPeriod)
      .then(setEntries)
      .catch((e) => message.error(e.message))
      .finally(() => setLoading(false));
  }, [companyId, selectedAccount, selectedPeriod]);

  const columns = [
    { title: 'Ngày', dataIndex: 'entryDate', key: 'entryDate', width: 100 },
    { title: 'Số CT', dataIndex: 'entryNumber', key: 'entryNumber', width: 140 },
    { title: 'Diễn giải', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'PS Nợ', dataIndex: 'debitAmount', key: 'debitAmount', width: 130, align: 'right' as const,
      render: (v: number) => v?.toLocaleString(),
    },
    { title: 'PS Có', dataIndex: 'creditAmount', key: 'creditAmount', width: 130, align: 'right' as const,
      render: (v: number) => v?.toLocaleString(),
    },
    { title: 'Lũy kế Nợ', dataIndex: 'runningDebit', key: 'runningDebit', width: 130, align: 'right' as const,
      render: (v: number) => v?.toLocaleString(),
    },
    { title: 'Lũy kế Có', dataIndex: 'runningCredit', key: 'runningCredit', width: 130, align: 'right' as const,
      render: (v: number) => v?.toLocaleString(),
    },
    { title: 'Số dư', dataIndex: 'runningBalance', key: 'runningBalance', width: 130, align: 'right' as const,
      render: (v: number) => <strong>{v?.toLocaleString()}</strong>,
    },
  ];

  return (
    <div>
      <h2>Sổ chi tiết tài khoản</h2>
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          style={{ width: 300 }}
          placeholder="Chọn tài khoản"
          allowClear
          value={selectedAccount}
          onChange={setSelectedAccount}
          options={accounts.map((a) => ({ value: a.id, label: `${a.accountNumber} - ${a.name}` }))}
          showSearch
          filterOption={(input, option) => (option?.label as string || '').toLowerCase().includes(input.toLowerCase())}
        />
        <Select
          style={{ width: 200 }}
          placeholder="Chọn kỳ"
          allowClear
          value={selectedPeriod}
          onChange={setSelectedPeriod}
          options={periods.map((p) => ({ value: p.id, label: p.periodName }))}
        />
      </Space>
      <Table dataSource={entries} columns={columns} rowKey="id"
        loading={loading} size="small" scroll={{ x: 1000 }} />
    </div>
  );
}
