import { Alert, App, Card, Form, Input, Select } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTeacher, type Teacher } from '../api/teachers';
import { FormActions } from '../components/FormActions';
import { PageHeader } from '../components/PageHeader';
import { CONTACT_NUMBER_PATTERN, SUBJECTS } from '../constants';

const subjectOptions = SUBJECTS.map((subject) => ({ label: subject, value: subject }));

export function AddTeacherPage() {
  const [form] = Form.useForm<Teacher>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  async function handleFinish(values: Teacher) {
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      await createTeacher({
        name: values.name.trim(),
        subject: values.subject,
        email: values.email.trim(),
        contactNumber: values.contactNumber.trim(),
      });
      message.success('Teacher added');
      navigate('/teachers');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to add teacher');
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title="Add Teacher" />
      <Card className="content-card form-card">
        <Form form={form} name="teacher" layout="vertical" requiredMark={false} onFinish={handleFinish}>
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, whitespace: true, message: 'Name is required' },
              { max: 100, message: 'Name must be at most 100 characters' },
            ]}
          >
            <Input placeholder="Name" autoComplete="off" maxLength={100} />
          </Form.Item>

          <Form.Item label="Subject" name="subject" rules={[{ required: true, message: 'Subject is required' }]}>
            <Select placeholder="Select a subject" options={subjectOptions} />
          </Form.Item>

          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, whitespace: true, message: 'Email address is required' },
              { type: 'email', message: 'Enter a valid email address' },
            ]}
          >
            <Input type="email" placeholder="Email address" autoComplete="off" />
          </Form.Item>

          <Form.Item
            label="Work Contact Number"
            name="contactNumber"
            rules={[
              { required: true, whitespace: true, message: 'Work contact number is required' },
              { pattern: CONTACT_NUMBER_PATTERN, message: 'Enter an 8-digit contact number' },
            ]}
          >
            <Input inputMode="numeric" placeholder="Work contact number" autoComplete="off" maxLength={8} />
          </Form.Item>

          {submitError && <Alert type="error" showIcon title={submitError} className="form-alert" />}

          <FormActions backTo="/teachers" submitLabel="Add Teacher" submitting={submitting} />
        </Form>
      </Card>
    </>
  );
}
