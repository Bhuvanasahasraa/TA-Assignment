import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Table, type TableColumnsType } from 'antd';
import { useNavigate } from 'react-router-dom';
import { listTeachers, type Teacher } from '../api/teachers';
import { EmptyState } from '../components/EmptyState';
import { LoadError } from '../components/LoadError';
import { PageHeader } from '../components/PageHeader';
import { formatContactNumber } from '../format';
import { useAsync } from '../hooks/useAsync';

const columns: TableColumnsType<Teacher> = [
  { title: '#', key: 'index', width: 64, render: (_value, _record, index) => index + 1 },
  { title: 'Name', dataIndex: 'name' },
  { title: 'Subject', dataIndex: 'subject' },
  { title: 'Email', dataIndex: 'email' },
  { title: 'Work Contact', dataIndex: 'contactNumber', render: formatContactNumber },
];

export function TeachersPage() {
  const navigate = useNavigate();
  const { data: teachers, error, loading, reload } = useAsync(listTeachers);
  const addButton = (
    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/teachers/new')}>
      Add Teacher
    </Button>
  );
  const isEmpty = !loading && !error && teachers?.length === 0;

  return (
    <>
      <PageHeader title="Teachers" extra={isEmpty ? undefined : addButton} />
      {error ? (
        <LoadError error={error} onRetry={reload} />
      ) : isEmpty ? (
        <EmptyState description="There are no existing teachers yet." action={addButton} />
      ) : (
        <Card className="content-card">
          <Table
            rowKey="email"
            columns={columns}
            dataSource={teachers}
            loading={loading}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      )}
    </>
  );
}
