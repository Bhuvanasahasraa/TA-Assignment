import { Flex, Typography } from 'antd';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  extra?: ReactNode;
}

export function PageHeader({ title, extra }: PageHeaderProps) {
  return (
    <Flex justify="space-between" align="center" gap={16} wrap className="page-header">
      <Typography.Title level={2} style={{ margin: 0 }}>
        {title}
      </Typography.Title>
      {extra}
    </Flex>
  );
}
