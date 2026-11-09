import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Table, type TableColumnsType } from 'antd';
import { useNavigate } from 'react-router-dom';
import { listClasses, type SchoolClass } from '../api/classes';
import { EmptyState } from '../components/EmptyState';
import { LoadError } from '../components/LoadError';
import { PageHeader } from '../components/PageHeader';
import { useAsync } from '../hooks/useAsync';

const columns: TableColumnsType<SchoolClass> = [
  { title: '#', key: 'index', width: 64, render: (_value, _record, index) => index + 1 },
  { title: 'Class Level', dataIndex: 'level' },
  { title: 'Class Name', dataIndex: 'name' },
  { title: 'Form Teacher', key: 'formTeacher', render: (_value, record) => record.formTeacher.name },
];

export function ClassesPage() {
  const navigate = useNavigate();
  const { data: classes, error, loading, reload } = useAsync(listClasses);
  const addButton = (
    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/classes/new')}>
      Add Class
    </Button>
  );
  const isEmpty = !loading && !error && classes?.length === 0;

  return (
    <>
      <PageHeader title="Classes" extra={isEmpty ? undefined : addButton} />
      {error ? (
        <LoadError error={error} onRetry={reload} />
      ) : isEmpty ? (
        <EmptyState description="There are no existing classes yet." action={addButton} />
      ) : (
        <Card className="content-card">
          <Table
            rowKey="name"
            columns={columns}
            dataSource={classes}
            loading={loading}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      )}
    </>
  );
}
