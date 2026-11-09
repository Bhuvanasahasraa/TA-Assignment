import { Alert, Button } from 'antd';

interface LoadErrorProps {
  error: Error;
  onRetry: () => void;
}

export function LoadError({ error, onRetry }: LoadErrorProps) {
  return (
    <Alert
      type="error"
      showIcon
      title="Something went wrong"
      description={error.message}
      action={<Button onClick={onRetry}>Try again</Button>}
    />
  );
}
