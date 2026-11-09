import { Button, Result } from 'antd';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { AddClassPage } from './pages/AddClassPage';
import { AddTeacherPage } from './pages/AddTeacherPage';
import { ClassesPage } from './pages/ClassesPage';
import { TeachersPage } from './pages/TeachersPage';

function NotFound() {
  return (
    <Result
      status="404"
      title="Page not found"
      extra={
        <Link to="/classes">
          <Button type="primary">Back to classes</Button>
        </Link>
      }
    />
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/classes" replace />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="classes/new" element={<AddClassPage />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="teachers/new" element={<AddTeacherPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
