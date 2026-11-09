import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as teachersApi from '../src/api/teachers';
import { AddTeacherPage } from '../src/pages/AddTeacherPage';
import { renderAt } from './renderWithRouter';

vi.mock('../src/api/teachers');

async function chooseSubject(user: ReturnType<typeof userEvent.setup>, subject: string) {
  await user.click(screen.getByRole('combobox', { name: /subject/i }));
  await user.click(await screen.findByTitle(subject));
}

describe('AddTeacherPage', () => {
  beforeEach(() => vi.resetAllMocks());

  it('shows field errors and does not submit an empty form', async () => {
    const user = userEvent.setup();
    renderAt('/teachers/new', <AddTeacherPage />);

    await user.click(screen.getByRole('button', { name: /add teacher/i }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Subject is required')).toBeInTheDocument();
    expect(screen.getByText('Email address is required')).toBeInTheDocument();
    expect(screen.getByText('Work contact number is required')).toBeInTheDocument();
    expect(teachersApi.createTeacher).not.toHaveBeenCalled();
  });

  it('rejects an invalid email and contact number', async () => {
    const user = userEvent.setup();
    renderAt('/teachers/new', <AddTeacherPage />);

    await user.type(screen.getByLabelText(/email address/i), 'mary');
    await user.type(screen.getByLabelText(/work contact number/i), '123');
    await user.click(screen.getByRole('button', { name: /add teacher/i }));

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Enter an 8-digit contact number')).toBeInTheDocument();
  });

  it('submits a valid teacher and returns to the list', async () => {
    const user = userEvent.setup();
    const teacher = { name: 'Mary', subject: 'Mathematics', email: 'teachermary@gmail.com', contactNumber: '68129414' };
    vi.mocked(teachersApi.createTeacher).mockResolvedValue(teacher);
    renderAt('/teachers/new', <AddTeacherPage />);

    await user.type(screen.getByLabelText(/^name/i), 'Mary');
    await chooseSubject(user, 'Mathematics');
    await user.type(screen.getByLabelText(/email address/i), 'teachermary@gmail.com');
    await user.type(screen.getByLabelText(/work contact number/i), '68129414');
    await user.click(screen.getByRole('button', { name: /add teacher/i }));

    expect(teachersApi.createTeacher).toHaveBeenCalledWith(teacher);
    expect(await screen.findByText('Navigated away')).toBeInTheDocument();
  });

  it('shows the API error message when the server rejects the teacher', async () => {
    const user = userEvent.setup();
    vi.mocked(teachersApi.createTeacher).mockRejectedValue(
      new Error('A teacher with email teachermary@gmail.com already exists'),
    );
    renderAt('/teachers/new', <AddTeacherPage />);

    await user.type(screen.getByLabelText(/^name/i), 'Mary');
    await chooseSubject(user, 'Mathematics');
    await user.type(screen.getByLabelText(/email address/i), 'teachermary@gmail.com');
    await user.type(screen.getByLabelText(/work contact number/i), '68129414');
    await user.click(screen.getByRole('button', { name: /add teacher/i }));

    expect(await screen.findByText('A teacher with email teachermary@gmail.com already exists')).toBeInTheDocument();
  });
});
