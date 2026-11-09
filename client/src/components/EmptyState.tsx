import { Card, Empty } from 'antd';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  description: string;
  action: ReactNode;
}

export function EmptyState({ description, action }: EmptyStateProps) {
  return (
    <Card className="content-card">
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} style={{ padding: '48px 0' }}>
        {action}
      </Empty>
    </Card>
  );
}
