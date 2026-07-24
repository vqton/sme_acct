import { useState, useEffect } from 'react';
import { Form, DatePicker, Select, Button, InputNumber, Space, Table, App, Card, Divider, Tag, Tabs, Alert } from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { TaxType, VatRate } from '../types';

const taxTypeOptions = [
  { value: TaxType.Vat, label: 'Thuế GTGT' },
  { value: TaxType.Cit, label: 'Thuế TNDN' },
  { value: TaxType.Pit, label: 'Thuế TNCN' },
  { value: TaxType.Sct, label: 'Thuế TTĐB' },
];

const rateOptions = [
  { value: VatRate.Zero, label: '0%' },
  { value: VatRate.Five, label: '5%' },
  { value: VatRate.Ten, label: '10%' },
];

export default function TaxDeclarationFormPage() {
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const [taxType, setTaxType] = useState<TaxType>(TaxType.Vat);
  const [periods, setPeriods] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [autoFillLoading, setAutoFillLoading] = useState(false);
  const [autoFillData, setAutoFillData] = useState<any>(null);
  const [outputLines, setOutputLines] = useState<Array<{ rate: VatRate; taxableAmount: number }>>([{ rate: VatRate.Ten, taxableAmount: 0 }]);
  const [inputLines, setInputLines] = useState<Array<{ rate: VatRate; taxableAmount: number }>>([{ rate: VatRate.Ten, taxableAmount: 0 }]);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const companyId = Number(localStorage.getItem('currentCompanyId'));

  const preselectedPeriod = searchParams.get('periodId');
  const preselectedTaxType = searchParams.get('taxType');

  useEffect(() => {
    if (!companyId) return;
    api.getTaxPeriods(companyId).then((data) => {
      setPeriods(data);
      if (preselectedPeriod) {
        form.setFieldsValue({ periodId: Number(preselectedPeriod) });
      }
    }).catch(() => {});
    if (preselectedTaxType) {
      const tt = Number(preselectedTaxType) as TaxType;
      setTaxType(tt);
    }
  }, [companyId, preselectedPeriod, preselectedTaxType, form]);

  const updateOutputLine = (i: number, patch: Partial<{ rate: VatRate; taxableAmount: number }>) => {
    setOutputLines(outputLines.map((l, idx) => idx === i ? { ...l, ...patch } : l));
  };

  const updateInputLine = (i: number, patch: Partial<{ rate: VatRate; taxableAmount: number }>) => {
    setInputLines(inputLines.map((l, idx) => idx === i ? { ...l, ...patch } : l));
  };

  const totalOutputVat = outputLines.reduce((s, l) => s + Math.round(l.taxableAmount * l.rate / 100), 0);
  const totalInputVat = inputLines.reduce((s, l) => s + Math.round(l.taxableAmount * l.rate / 100), 0);
  const vatPayable = Math.max(0, totalOutputVat - totalInputVat);

  const handleAutoFill = async () => {
    const periodId = form.getFieldValue('periodId');
    if (!periodId) { message.warning('Chọn kỳ tính thuế'); return; }
    setAutoFillLoading(true);
    try {
      const data = taxType === TaxType.Cit
        ? await api.autoFillCit(companyId, periodId)
        : await api.autoFillVat(companyId, periodId);
      setAutoFillData(data);
      if (data.outputLines?.length) {
        setOutputLines(data.outputLines.map((l: any) => ({ rate: l.rate ?? VatRate.Ten, taxableAmount: l.taxableAmount ?? 0 })));
      }
      if (data.inputLines?.length) {
        setInputLines(data.inputLines.map((l: any) => ({ rate: l.rate ?? VatRate.Ten, taxableAmount: l.taxableAmount ?? 0 })));
      }
      message.success('Đã lấy dữ liệu từ sổ kế toán');
    } catch (e: any) {
      message.error(e.message || 'Không thể tự động điền');
    } finally {
      setAutoFillLoading(false);
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (!values.periodId) { message.error('Chọn kỳ tính thuế'); return; }
    setSubmitting(true);
    try {
      const payload = {
        periodId: values.periodId,
        outputLines: outputLines.filter((l) => l.taxableAmount > 0),
        inputLines: inputLines.filter((l) => l.taxableAmount > 0),
      };
      const result = await api.createVatDeclaration(companyId, values.periodId, payload.outputLines, payload.inputLines);
      message.success('Đã tạo tờ khai: ' + result.declarationNumber);
      navigate('/accounting/tax');
    } catch (e: any) {
      message.error(e.message || 'Lỗi');
    } finally {
      setSubmitting(false);
    }
  };

  const lineColumns = (type: 'output' | 'input') => {
    const lines = type === 'output' ? outputLines : inputLines;
    const update = type === 'output' ? updateOutputLine : updateInputLine;
    return [
      { title: 'Thuế suất', dataIndex: 'rate', key: 'rate', width: 100,
        render: (_: any, __: any, i: number) => (
          <Select
            style={{ width: 80 }}
            value={lines[i]?.rate}
            onChange={(v) => update(i, { rate: v })}
            options={rateOptions}
          />
        ),
      },
      { title: 'Doanh số chịu thuế', dataIndex: 'taxableAmount', key: 'taxableAmount', width: 180,
        render: (_: any, __: any, i: number) => (
          <InputNumber
            style={{ width: '100%' }}
            value={lines[i]?.taxableAmount}
            onChange={(v) => update(i, { taxableAmount: v || 0 })}
            min={0}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          />
        ),
      },
      { title: 'Thuế GTGT', key: 'vatAmount', width: 150, align: 'right' as const,
        render: (_: any, __: any, i: number) => {
          const line = lines[i];
          if (!line) return null;
          const amount = Math.round(line.taxableAmount * line.rate / 100);
          return <strong>{amount.toLocaleString()}</strong>;
        },
      },
      { title: '', key: 'actions', width: 50,
        render: (_: any, __: any, i: number) => (
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => {
            const next = lines.filter((_, idx) => idx !== i);
            type === 'output' ? setOutputLines(next.length ? next : [{ rate: VatRate.Ten, taxableAmount: 0 }]) : setInputLines(next.length ? next : [{ rate: VatRate.Ten, taxableAmount: 0 }]);
          }} disabled={lines.length <= 1} />
        ),
      },
    ];
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      <h2>Tạo tờ khai thuế</h2>

      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical">
          <Space style={{ width: '100%' }} size="large" wrap>
            <Form.Item name="taxType" label="Loại thuế" initialValue={taxType} style={{ width: 200 }}>
              <Select options={taxTypeOptions} onChange={(v) => setTaxType(v)} />
            </Form.Item>
            <Form.Item name="periodId" label="Kỳ tính thuế" rules={[{ required: true }]} style={{ width: 250 }}>
              <Select
                placeholder="Chọn kỳ"
                options={periods.filter((p: any) => p.status === 1).map((p: any) => ({ value: p.id, label: p.periodName }))}
              />
            </Form.Item>
            <Form.Item name="declarationDate" label="Ngày lập" initialValue={new Date()} style={{ width: 200 }}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Space>
        </Form>
      </Card>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
            Thuế GTGT theo phương pháp khấu trừ
          </Tag>
        </Space>
        <Button icon={<ThunderboltOutlined />} onClick={handleAutoFill} loading={autoFillLoading}>
          Tự động điền từ sổ kế toán
        </Button>
      </div>

      {autoFillData?.captions && (
        <Alert message="Đã tải dữ liệu tự động" description={Object.entries(autoFillData.captions).map(([k, v]) => `${k}: ${v}`).join(', ')} type="info" showIcon style={{ marginBottom: 16 }} />
      )}

      <Tabs items={[
        { key: 'output', label: 'Đầu ra (Doanh số bán ra)',
          children: (
            <div>
              <Table
                dataSource={outputLines.map((l, i) => ({ ...l, key: i }))}
                columns={lineColumns('output')}
                pagination={false}
                size="small"
                footer={() => (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => setOutputLines([...outputLines, { rate: VatRate.Ten, taxableAmount: 0 }])}>
                      Thêm dòng
                    </Button>
                    <Space>
                      <strong>Tổng thuế đầu ra: {totalOutputVat.toLocaleString()}</strong>
                    </Space>
                  </div>
                )}
              />
            </div>
          ),
        },
        { key: 'input', label: 'Đầu vào (Hàng hóa mua vào)',
          children: (
            <div>
              <Table
                dataSource={inputLines.map((l, i) => ({ ...l, key: i }))}
                columns={lineColumns('input')}
                pagination={false}
                size="small"
                footer={() => (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => setInputLines([...inputLines, { rate: VatRate.Ten, taxableAmount: 0 }])}>
                      Thêm dòng
                    </Button>
                    <Space>
                      <strong>Tổng thuế đầu vào: {totalInputVat.toLocaleString()}</strong>
                    </Space>
                  </div>
                )}
              />
            </div>
          ),
        },
      ]} />

      <Divider />

      <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: 12 }}>Tổng thuế GTGT đầu ra</div>
            <div style={{ fontSize: 18, fontWeight: 'bold' }}>{totalOutputVat.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: 12 }}>Tổng thuế GTGT đầu vào</div>
            <div style={{ fontSize: 18, fontWeight: 'bold' }}>{totalInputVat.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: 12 }}>Thuế GTGT phải nộp</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: vatPayable > 0 ? '#cf1322' : '#52c41a' }}>{vatPayable.toLocaleString()}</div>
            {totalOutputVat < totalInputVat && (
              <Tag color="blue" style={{ marginTop: 4 }}>Được khấu trừ: {(totalInputVat - totalOutputVat).toLocaleString()}</Tag>
            )}
          </div>
        </div>
      </Card>

      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button onClick={() => navigate('/accounting/tax')}>Hủy</Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit} loading={submitting}>
            Lưu tờ khai
          </Button>
        </Space>
      </div>
    </div>
  );
}
