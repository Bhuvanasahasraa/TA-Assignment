import { Alert, App, Card, Form, Input, Select, Typography } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClass, type NewSchoolClass } from '../api/classes';
import { listTeachers } from '../api/teachers';
import { FormActions } from '../components/FormActions';
import { PageHeader } from '../components/PageHeader';
import { LEVELS } from '../constants';
import { useAsync } from '../hooks/useAsync';

const levelOptions = LEVELS.map((level) => ({ label: level, value: level }));

function NoTeachers() {
  return (
    <Typography.Text type="secondary">
      No existing teachers. <Link to="/teachers/new">Add a teacher</Link>
    </Typography.Text>
  );
}

export function AddClassPage() {
  const [form] = Form.useForm<NewSchoolClass>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const teachers = useAsync(listTeachers);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const teacherOptions = (teachers.data ?? []).map((teacher) => ({ label: teacher.name, value: teacher.email }));

  async function handleFinish(values: NewSchoolClass) {
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      await createClass({ level: values.level, name: values.name.trim(), teacherEmail: values.teacherEmail });
      message.success('Class added');
      navigate('/classes');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to add class');
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title="Add Class" />
      <Card className="content-card form-card">
        <Form form={form} name="class" layout="vertical" requiredMark={false} onFinish={handleFinish}>
          <Form.Item label="Class Level" name="level" rules={[{ required: true, message: 'Class level is required' }]}>
            <Select placeholder="Select a level" options={levelOptions} />
          </Form.Item>

          <Form.Item
            label="Class Name"
            name="name"
            rules={[
              { required: true, whitespace: true, message: 'Class name is required' },
              { max: 50, message: 'Class name must be at most 50 characters' },
            ]}
          >
            <Input placeholder="Class name" autoComplete="off" maxLength={50} />
          </Form.Item>

          <Form.Item
            label="Form Teacher"
            name="teacherEmail"
            rules={[{ required: true, message: 'Form teacher is required' }]}
            extra={teachers.error ? `Unable to load teachers: ${teachers.error.message}` : undefined}
          >
            <Select
              placeholder="Assign a form teacher"
              options={teacherOptions}
              loading={teachers.loading}
              notFoundContent={teachers.loading ? undefined : <NoTeachers />}
              showSearch={{ optionFilterProp: 'label' }}
            />
          </Form.Item>

          {submitError && <Alert type="error" showIcon title={submitError} className="form-alert" />}

          <FormActions backTo="/classes" submitLabel="Add Class" submitting={submitting} />
        </Form>
      </Card>
    </>
  );
}
