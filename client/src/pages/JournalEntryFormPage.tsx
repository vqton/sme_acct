import { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Select, Button, InputNumber, Space, Table, App, Card, Divider, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAccounts, createJournalEntry } from '../services/api';

const entryTypeOptions = [
  { value: 1, label: 'Phiếu thu' }, { value: 2, label: 'Phiếu chi' },
  { value: 3, label: 'Báo Có' }, { value: 4, label: 'Báo Nợ' },
  { value: 5, label: 'Mua hàng' }, { value: 6, label: 'Bán hàng' },
  { value: 9, label: 'Tổng hợp' }, { value: 10, label: 'Điều chỉnh' },
  { value: 11, label: 'Kết chuyển' }, { value: 99, label: 'Khác' },
];

export default function JournalEntryFormPage() {
  const [form] = Form.useForm();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [lines, setLines] = useState<Array<{ accountId?: number; accountNumber?: string; debitAmount: number; creditAmount: number; description?: string }>>([{ accountId: undefined, accountNumber: undefined, debitAmount: 0, creditAmount: 0 }]);

  function updateLine(i: number, patch: Partial<{ accountId: number; accountNumber: string; debitAmount: number; creditAmount: number; description: string }>) {
    const next = lines.map((l, idx) => idx === i ? { ...l, debitAmount: 0, creditAmount: 0, ...patch } : l);
    setLines(next);
  }
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const companyId = Number(localStorage.getItem('currentCompanyId'));

  useEffect(() => {
    getAccounts(companyId).then(setAccounts).catch(() => {});
  }, [companyId]);

  const accountOptions = accounts
    .filter((a) => a.allowTransactions)
    .map((a) => ({ value: a.id, label: `${a.accountNumber} - ${a.name}`, number: a.accountNumber }));

  const totalDebit = lines.reduce((s, l) => s + (l.debitAmount || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (l.creditAmount || 0), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const addLine = () => setLines([...lines, { accountId: undefined, accountNumber: undefined, debitAmount: 0, creditAmount: 0 }]);
  const removeLine = (i: number) => lines.length > 1 && setLines(lines.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (!balanced) { message.error('Tổng Nợ và Tổng Có không cân bằng'); return; }
    if (lines.some((l) => !l.accountId)) { message.error('Chọn tài khoản cho tất cả dòng'); return; }

    setSubmitting(true);
    try {
      const linesData = lines.map((l) => ({
        accountId: l.accountId || '',
        accountNumber: l.accountNumber || '',
        debitAmount: l.debitAmount || 0,
        creditAmount: l.creditAmount || 0,
        description: l.description || '',
      }));
      const entry = await createJournalEntry({
        companyId,
        entryDate: values.entryDate.format('YYYY-MM-DD'),
        entryType: values.entryType,
        description: values.description,
        lines: linesData,
      });
      message.success('Đã tạo chứng từ: ' + entry.entryNumber);
      navigate('/accounting/journal-entries');
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const lineColumns = [
    { title: 'Tài khoản', dataIndex: 'accountId', key: 'accountId', width: 300,
      render: (_: any, __: any, i: number) => {
        const line = lines[i];
        if (!line) return null;
        return (
        <Select
          showSearch
          style={{ width: '100%' }}
          options={accountOptions}
          value={line.accountId || undefined}
          onChange={(val) => {
            const opt = accountOptions.find((o) => o.value === val);
            updateLine(i, { accountId: val, accountNumber: opt?.number || '' });
          }}
          filterOption={(input, option) => (option?.label as string || '').toLowerCase().includes(input.toLowerCase())}
          placeholder="Chọn tài khoản"
        />
        );
      },
    },
    { title: 'PS Nợ', dataIndex: 'debitAmount', key: 'debitAmount', width: 150,
      render: (_: any, __: any, i: number) => {
        const line = lines[i];
        if (!line) return null;
        return (
        <InputNumber
          style={{ width: '100%' }}
          value={line.debitAmount}
          onChange={(v) => {
            updateLine(i, { debitAmount: v || 0, creditAmount: (v && v > 0) ? 0 : line.creditAmount });
          }}
          min={0}
        />
        );
      },
    },
    { title: 'PS Có', dataIndex: 'creditAmount', key: 'creditAmount', width: 150,
      render: (_: any, __: any, i: number) => {
        const line = lines[i];
        if (!line) return null;
        return (
        <InputNumber
          style={{ width: '100%' }}
          value={line.creditAmount}
          onChange={(v) => {
            updateLine(i, { creditAmount: v || 0, debitAmount: (v && v > 0) ? 0 : line.debitAmount });
          }}
          min={0}
        />
        );
      },
    },
    { title: 'Diễn giải', dataIndex: 'description', key: 'description', width: 200,
      render: (_: any, __: any, i: number) => {
        const line = lines[i];
        if (!line) return null;
        return (
        <Input value={line.description} onChange={(e) => {
          updateLine(i, { description: e.target.value });
        }} />
        );
      },
    },
    { title: '', key: 'actions', width: 50,
      render: (_: any, __: any, i: number) => (
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeLine(i)} disabled={lines.length <= 1} />
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1000 }}>
      <h2>Thêm chứng từ kế toán</h2>
      <Card>
        <Form form={form} layout="vertical">
          <Space style={{ width: '100%' }} size="large" wrap>
            <Form.Item name="entryDate" label="Ngày chứng từ" rules={[{ required: true }]} style={{ width: 200 }}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="entryType" label="Loại chứng từ" rules={[{ required: true }]} style={{ width: 200 }}>
              <Select options={entryTypeOptions} />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="Diễn giải" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Card>

      <Divider>Chi tiết định khoản</Divider>

      <Table
        dataSource={lines.map((l, i) => ({ ...l, key: i }))}
        columns={lineColumns}
        pagination={false}
        size="small"
        footer={() => (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button type="dashed" icon={<PlusOutlined />} onClick={addLine}>Thêm dòng</Button>
            <Space>
              <strong>Tổng Nợ: {totalDebit.toLocaleString()}</strong>
              <strong>Tổng Có: {totalCredit.toLocaleString()}</strong>
              <Tag color={balanced ? 'success' : 'error'}>{balanced ? 'Cân bằng' : 'Mất cân bằng'}</Tag>
            </Space>
          </div>
        )}
      />

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Space>
          <Button onClick={() => navigate('/accounting/journal-entries')}>Hủy</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit} loading={submitting}>
            Lưu chứng từ
          </Button>
        </Space>
      </div>
    </div>
  );
}
