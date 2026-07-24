import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Space, App, Typography, Table, Spin, Modal } from 'antd';
import { ArrowLeftOutlined, SendOutlined, HistoryOutlined, EditOutlined } from '@ant-design/icons';
import { api } from '../services/api';
import type { TaxDeclaration } from '../types';
import { DeclarationStatus, TaxType } from '../types';

const taxTypeLabels: Record<TaxType, string> = {
  [TaxType.Vat]: 'Thuế GTGT', [TaxType.Cit]: 'Thuế TNDN', [TaxType.Pit]: 'Thuế TNCN',
  [TaxType.License]: 'Lệ phí môn bài', [TaxType.Sct]: 'Thuế TTĐB',
  [TaxType.ResourceTax]: 'Thuế tài nguyên', [TaxType.EnvironmentalTax]: 'Thuế BV môi trường', [TaxType.Fct]: 'FCT',
};

const statusLabels: Record<DeclarationStatus, string> = {
  [DeclarationStatus.Draft]: 'Nháp', [DeclarationStatus.Submitted]: 'Đã nộp',
  [DeclarationStatus.Adjusted]: 'Đã điều chỉnh', [DeclarationStatus.Cancelled]: 'Hủy',
};

const statusColors: Record<DeclarationStatus, string> = {
  [DeclarationStatus.Draft]: 'default', [DeclarationStatus.Submitted]: 'success',
  [DeclarationStatus.Adjusted]: 'warning', [DeclarationStatus.Cancelled]: 'error',
};

export default function TaxDeclarationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [decl, setDecl] = useState<TaxDeclaration | null>(null);
  const [audit, setAudit] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.getTaxDeclaration(Number(id)),
      api.getDeclarationAudit(Number(id)),
    ])
      .then(([d, a]) => {
        setDecl(d);
        setAudit(Array.isArray(a) ? a : []);
      })
      .catch((e) => message.error(e.message || 'Lỗi tải tờ khai'))
      .finally(() => setLoading(false));
  }, [id, message]);

  const handleSubmit = () => {
    if (!decl) return;
    Modal.confirm({
      title: 'Nộp tờ khai?',
      content: 'Sau khi nộp sẽ không thể sửa.',
      onOk: async () => {
        try {
          await api.submitTaxDeclaration(decl.id);
          message.success('Đã nộp tờ khai');
          const updated = await api.getTaxDeclaration(decl.id);
          setDecl(updated);
        } catch (e: any) { message.error(e.message || 'Lỗi'); }
      },
    });
  };

  if (loading) return <Spin style={{ display: 'block', margin: '40px auto' }} />;
  if (!decl) return <Typography.Text type="danger">Không tìm thấy tờ khai</Typography.Text>;

  const metadata = decl.metadata ? (typeof decl.metadata === 'string' ? JSON.parse(decl.metadata) : decl.metadata) : null;

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/accounting/tax')}>Quay lại</Button>
          <h2 style={{ margin: 0 }}>Tờ khai {decl.declarationNumber}</h2>
          <Tag color={statusColors[decl.status as DeclarationStatus]}>{statusLabels[decl.status as DeclarationStatus]}</Tag>
        </Space>
        <Space>
          {decl.status === DeclarationStatus.Draft && (
            <>
              <Button icon={<SendOutlined />} type="primary" onClick={handleSubmit}>Nộp tờ khai</Button>
              <Button icon={<EditOutlined />}>Sửa</Button>
            </>
          )}
          <Button icon={<HistoryOutlined />} onClick={async () => {
            const a = await api.getDeclarationAudit(decl.id);
            setAudit(Array.isArray(a) ? a : []);
          }}>Lịch sử</Button>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions title="Thông tin chung" column={2} size="small">
          <Descriptions.Item label="Số tờ khai">{decl.declarationNumber}</Descriptions.Item>
          <Descriptions.Item label="Ngày lập">{decl.declarationDate?.split('T')[0]}</Descriptions.Item>
          <Descriptions.Item label="Loại thuế">
            <Tag color="blue">{taxTypeLabels[decl.taxType as TaxType]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Kỳ">{decl.periodName}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={statusColors[decl.status as DeclarationStatus]}>{statusLabels[decl.status as DeclarationStatus]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Điều chỉnh">{decl.isAdjustment ? 'Có' : 'Không'}</Descriptions.Item>
          {decl.submittedAt && (
            <>
              <Descriptions.Item label="Ngày nộp">{decl.submittedAt?.split('T')[0]}</Descriptions.Item>
              <Descriptions.Item label="Người nộp">#{decl.submittedByUserId}</Descriptions.Item>
            </>
          )}
        </Descriptions>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions title="Số thuế" column={2} size="small">
          <Descriptions.Item label="Tổng thuế phải nộp">
            <strong>{decl.totalTaxPayable?.toLocaleString()}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Giảm thuế">{decl.taxReduction?.toLocaleString() || '-'}</Descriptions.Item>
          <Descriptions.Item label="Miễn thuế">{decl.taxExemption?.toLocaleString() || '-'}</Descriptions.Item>
          <Descriptions.Item label="Tín dụng thuế">{decl.taxCredit?.toLocaleString() || '-'}</Descriptions.Item>
          <Descriptions.Item label="Phải nộp sau giảm trừ">
            <strong>{decl.taxPayableAfterDeductions?.toLocaleString()}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Phạt">{decl.penalties?.toLocaleString() || '-'}</Descriptions.Item>
          <Descriptions.Item label="Tổng cộng">
            <span style={{ fontSize: 16, fontWeight: 'bold', color: '#cf1322' }}>{decl.totalDue?.toLocaleString()}</span>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {metadata?.outputLines && (
        <Card title="Chi tiết đầu ra (Doanh số bán ra)" style={{ marginBottom: 16 }}>
          <Table
            dataSource={metadata.outputLines}
            columns={[
              { title: 'Thuế suất', dataIndex: 'rate', width: 100, render: (v: number) => `${v}%` },
              { title: 'Doanh số chịu thuế', dataIndex: 'taxableAmount', width: 150, align: 'right', render: (v: number) => v?.toLocaleString() },
              { title: 'Thuế GTGT', dataIndex: 'vatAmount', width: 150, align: 'right', render: (v: number) => <strong>{v?.toLocaleString()}</strong> },
            ]}
            rowKey={(_, i) => String(i)}
            pagination={false}
            size="small"
            summary={() => {
              const total = (metadata.outputLines || []).reduce((s: number, l: any) => s + (l.vatAmount || 0), 0);
              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}><strong>Tổng</strong></Table.Summary.Cell>
                  <Table.Summary.Cell index={1} />
                  <Table.Summary.Cell index={2} align="right"><strong>{total.toLocaleString()}</strong></Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />
        </Card>
      )}

      {metadata?.inputLines && (
        <Card title="Chi tiết đầu vào (Hàng hóa mua vào)" style={{ marginBottom: 16 }}>
          <Table
            dataSource={metadata.inputLines}
            columns={[
              { title: 'Thuế suất', dataIndex: 'rate', width: 100, render: (v: number) => `${v}%` },
              { title: 'Doanh số chịu thuế', dataIndex: 'taxableAmount', width: 150, align: 'right', render: (v: number) => v?.toLocaleString() },
              { title: 'Thuế GTGT', dataIndex: 'vatAmount', width: 150, align: 'right', render: (v: number) => <strong>{v?.toLocaleString()}</strong> },
            ]}
            rowKey={(_, i) => String(i)}
            pagination={false}
            size="small"
            summary={() => {
              const total = (metadata.inputLines || []).reduce((s: number, l: any) => s + (l.vatAmount || 0), 0);
              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}><strong>Tổng</strong></Table.Summary.Cell>
                  <Table.Summary.Cell index={1} />
                  <Table.Summary.Cell index={2} align="right"><strong>{total.toLocaleString()}</strong></Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />
        </Card>
      )}

      {decl.notes && (
        <Card title="Ghi chú" style={{ marginBottom: 16 }}>
          <Typography.Paragraph>{decl.notes}</Typography.Paragraph>
        </Card>
      )}

      {audit.length > 0 && (
        <Card title="Lịch sử thay đổi">
          {audit.map((e: any, i: number) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
              <Space>
                <Tag>{statusLabels[e.fromStatus as DeclarationStatus]}</Tag>
                <span>→</span>
                <Tag color={statusColors[e.toStatus as DeclarationStatus]}>{statusLabels[e.toStatus as DeclarationStatus]}</Tag>
                <Typography.Text type="secondary">{e.changedAt?.split('T')[0]}</Typography.Text>
              </Space>
              {e.comment && <div style={{ marginTop: 4, color: '#666' }}>{e.comment}</div>}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
