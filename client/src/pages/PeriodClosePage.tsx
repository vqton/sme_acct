import { useState, useEffect } from 'react';
import { Table, Select, Button, Space, Card, Tag, Modal, App } from 'antd';
import { getFiscalPeriods, validateClose, closePeriodWithValidation, carryForwardBalances } from '../services/api';

export default function PeriodClosePage() {
  const [periods, setPeriods] = useState<any[]>([]);
  const [periodId, setPeriodId] = useState<number>();
  const [validation, setValidation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const companyId = Number(localStorage.getItem('currentCompanyId'));
  const userId = Number(localStorage.getItem('userId'));

  useEffect(() => {
    if (!companyId) return;
    getFiscalPeriods(companyId).then(setPeriods).catch(() => {});
  }, [companyId]);

  const runValidation = () => {
    if (!companyId || !periodId) return;
    setLoading(true);
    validateClose(companyId, periodId)
      .then(setValidation)
      .catch((e: any) => message.error(e.message))
      .finally(() => setLoading(false));
  };

  const doClose = () => {
    if (!companyId || !periodId) return;
    Modal.confirm({
      title: 'Xác nhận khóa sổ?',
      content: 'Sau khi khóa sổ, kỳ này sẽ không thể thực hiện thêm nghiệp vụ nào.',
      onOk: async () => {
        try {
          const nextPeriod = periods.find((p: any) =>
            p.year > periodId || (p.year === periodId && p.month > (periods.find((x: any) => x.id === periodId)?.month ?? 0))
          );
          const result = await closePeriodWithValidation(companyId, periodId, userId, {
            skipValidation: true,
            carryForwardToPeriodId: nextPeriod?.id,
            transferNetIncome: true,
          });
          message.success('Khóa sổ thành công');
          setValidation(null);
          getFiscalPeriods(companyId).then(setPeriods);
        } catch (e: any) {
          message.error(e.message);
        }
      },
    });
  };

  const checksColumns = [
    { title: 'Kiểm tra', dataIndex: 'name', key: 'name' },
    {
      title: 'Kết quả', dataIndex: 'passed', key: 'passed',
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Đạt' : 'Không đạt'}</Tag>,
    },
    { title: 'Chi tiết', dataIndex: 'message', key: 'message' },
  ];

  return (
    <Card title="Khóa sổ kế toán">
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Chọn kỳ cần khóa"
          style={{ width: 250 }}
          value={periodId}
          onChange={(v) => { setPeriodId(v); setValidation(null); }}
          options={periods.filter((p: any) => p.status === 1).map((p: any) => ({ value: p.id, label: p.periodName }))}
        />
        <Button onClick={runValidation} disabled={!periodId} loading={loading}>Kiểm tra</Button>
        <Button type="primary" onClick={doClose} disabled={!periodId || validation?.valid === false}>
          Khóa sổ
        </Button>
      </Space>

      {validation && (
        <>
          <h4>
            Kết quả kiểm tra:{' '}
            <Tag color={validation.valid ? 'green' : 'red'}>
              {validation.valid ? 'Đạt yêu cầu' : 'Không đạt'}
            </Tag>
          </h4>
          <Table
            dataSource={validation.checks}
            columns={checksColumns}
            pagination={false}
            size="small"
            rowKey="name"
          />
        </>
      )}
    </Card>
  );
}
