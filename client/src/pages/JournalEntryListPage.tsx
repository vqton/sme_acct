import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, App, Modal } from 'antd';
import { PlusOutlined, CheckCircleOutlined, SwapOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getJournalEntries, postJournalEntry, reverseJournalEntry, deleteJournalEntry } from '../services/api';

const entryTypeLabels: Record<number, string> = {
  1: 'Phiếu thu', 2: 'Phiếu chi', 3: 'Báo Có', 4: 'Báo Nợ',
  5: 'Mua hàng', 6: 'Bán hàng', 7: 'KH TSCĐ', 8: 'Phân bổ CCDC',
  9: 'Tổng hợp', 10: 'Điều chỉnh', 11: 'Kết chuyển', 12: 'Khóa sổ', 99: 'Khác',
};

const entryTypeColors: Record<number, string> = {
  1: 'green', 2: 'red', 3: 'blue', 4: 'orange', 5: 'purple',
  6: 'cyan', 9: 'geekblue', 10: 'gold', 11: 'magenta',
};

export default function JournalEntryListPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const companyId = localStorage.getItem('currentCompanyId') || '';

  const fetchEntries = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      setEntries(await getJournalEntries(companyId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, [companyId]);

  const handlePost = async (id: string) => {
    try {
      await postJournalEntry(id);
      message.success('Đã ghi sổ');
      fetchEntries();
    } catch (e: any) {
      message.error(e.message);
    }
  };

  const handleReverse = (id: string) => {
    Modal.confirm({
      title: 'Đảo ngược chứng từ?',
      content: 'Sẽ tạo chứng từ đảo ngược với số tiền đối ứng.',
      onOk: async () => {
        await reverseJournalEntry(id);
        message.success('Đã đảo ngược');
        fetchEntries();
      },
    });
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xóa chứng từ?',
      content: 'Chỉ xóa được chứng từ chưa ghi sổ.',
      onOk: async () => {
        await deleteJournalEntry(id);
        message.success('Đã xóa');
        fetchEntries();
      },
    });
  };

  const columns = [
    { title: 'Số CT', dataIndex: 'entryNumber', key: 'entryNumber', width: 150 },
    { title: 'Ngày', dataIndex: 'entryDate', key: 'entryDate', width: 110 },
    { title: 'Loại', dataIndex: 'entryType', key: 'entryType', width: 100,
      render: (v: number) => <Tag color={entryTypeColors[v]}>{entryTypeLabels[v] || v}</Tag>,
    },
    { title: 'Diễn giải', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'PS Nợ', dataIndex: 'totalDebit', key: 'totalDebit', width: 130, align: 'right' as const,
      render: (v: number) => v?.toLocaleString(),
    },
    { title: 'PS Có', dataIndex: 'totalCredit', key: 'totalCredit', width: 130, align: 'right' as const,
      render: (v: number) => v?.toLocaleString(),
    },
    { title: 'Trạng thái', key: 'status', width: 110,
      render: (_: any, r: any) => r.isReversed
        ? <Tag color="default">Đã đảo ngược</Tag>
        : r.isPosted
        ? <Tag color="success">Đã ghi sổ</Tag>
        : <Tag color="warning">Chưa ghi sổ</Tag>,
    },
    { title: '', key: 'actions', width: 160,
      render: (_: any, r: any) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/accounting/journal-entries/${r.id}`)} />
          {!r.isPosted && (
            <>
              <Button type="link" icon={<CheckCircleOutlined />} onClick={() => handlePost(r.id)} />
              <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} />
            </>
          )}
          {r.isPosted && !r.isReversed && (
            <Button type="link" icon={<SwapOutlined />} onClick={() => handleReverse(r.id)} />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Chứng từ kế toán</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/accounting/journal-entries/new')}>
          Thêm chứng từ
        </Button>
      </div>
      <Table dataSource={entries} columns={columns} rowKey="id" loading={loading}
        size="small" scroll={{ x: 1000 }} />
    </div>
  );
}
