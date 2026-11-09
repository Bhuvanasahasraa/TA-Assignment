import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as classesApi from '../src/api/classes';
import * as teachersApi from '../src/api/teachers';
import { AddClassPage } from '../src/pages/AddClassPage';
import { renderAt } from './renderWithRouter';

vi.mock('../src/api/classes');
vi.mock('../src/api/teachers');

describe('AddClassPage', () => {
  beforeEach(() => vi.resetAllMocks());

  it('offers a link to add a teacher when none exist', async () => {
    const user = userEvent.setup();
    vi.mocked(teachersApi.listTeachers).mockResolvedValue([]);
    renderAt('/classes/new', <AddClassPage />);

    await user.click(screen.getByRole('combobox', { name: /form teacher/i }));

    expect(await screen.findByText('No existing teachers.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /add a teacher/i })).toHaveAttribute('href', '/teachers/new');
  });

  it('submits the class with the chosen teacher email', async () => {
    const user = userEvent.setup();
    vi.mocked(teachersApi.listTeachers).mockResolvedValue([
      { name: 'Mary', subject: 'Mathematics', email: 'teachermary@gmail.com', contactNumber: '68129414' },
    ]);
    vi.mocked(classesApi.createClass).mockResolvedValue({
      level: 'Primary 1',
      name: 'Class 1A',
      formTeacher: { name: 'Mary' },
    });
    renderAt('/classes/new', <AddClassPage />);

    await user.click(screen.getByRole('combobox', { name: /class level/i }));
    await user.click(await screen.findByTitle('Primary 1'));
    await user.type(screen.getByLabelText(/class name/i), 'Class 1A');
    await user.click(screen.getByRole('combobox', { name: /form teacher/i }));
    await user.click(await screen.findByTitle('Mary'));
    await user.click(screen.getByRole('button', { name: /add class/i }));

    expect(classesApi.createClass).toHaveBeenCalledWith({
      level: 'Primary 1',
      name: 'Class 1A',
      teacherEmail: 'teachermary@gmail.com',
    });
    expect(await screen.findByText('Navigated away')).toBeInTheDocument();
  });
});
