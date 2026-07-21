import { Card, Typography, Tag } from 'antd';
import { ConstructionOutlined } from '@ant-design/icons';

interface Props {
  name: string;
  description?: string;
}

export default function ModuleStub({ name, description }: Props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
      <Card style={{ maxWidth: 500, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16, color: '#d9d9d9' }}>
          🏗️
        </div>
        <Typography.Title level={3}>{name}</Typography.Title>
        <Tag color="orange">Sẽ phát triển trong phiên bản tiếp theo</Tag>
        {description && (
          <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>
            {description}
          </Typography.Paragraph>
        )}
      </Card>
    </div>
  );
}
