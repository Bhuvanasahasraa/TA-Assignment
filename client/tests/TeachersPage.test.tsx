import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as teachersApi from '../src/api/teachers';
import { TeachersPage } from '../src/pages/TeachersPage';
import { renderAt } from './renderWithRouter';

vi.mock('../src/api/teachers');

describe('TeachersPage', () => {
  beforeEach(() => vi.resetAllMocks());

  it('shows the empty state when there are no teachers', async () => {
    vi.mocked(teachersApi.listTeachers).mockResolvedValue([]);
    renderAt('/teachers', <TeachersPage />);

    expect(await screen.findByText('There are no existing teachers yet.')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /add teacher/i }).length).toBeGreaterThan(0);
  });

  it('lists teachers in a table', async () => {
    vi.mocked(teachersApi.listTeachers).mockResolvedValue([
      { name: 'Mary', subject: 'Mathematics', email: 'teachermary@gmail.com', contactNumber: '68129414' },
    ]);
    renderAt('/teachers', <TeachersPage />);

    expect(await screen.findByRole('cell', { name: 'Mary' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'teachermary@gmail.com' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '6812 9414' })).toBeInTheDocument();
  });

  it('shows the server error when loading fails', async () => {
    vi.mocked(teachersApi.listTeachers).mockRejectedValue(new Error('Database unavailable'));
    renderAt('/teachers', <TeachersPage />);

    expect(await screen.findByText('Database unavailable')).toBeInTheDocument();
  });
});
