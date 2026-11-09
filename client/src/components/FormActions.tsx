import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import { useNavigate } from 'react-router-dom';

interface FormActionsProps {
  backTo: string;
  submitLabel: string;
  submitting: boolean;
}

export function FormActions({ backTo, submitLabel, submitting }: FormActionsProps) {
  const navigate = useNavigate();
  return (
    <Flex justify="space-between" gap={12} className="form-actions">
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(backTo)} disabled={submitting}>
        Back
      </Button>
      <Button type="primary" htmlType="submit" loading={submitting}>
        {submitLabel}
      </Button>
    </Flex>
  );
}
