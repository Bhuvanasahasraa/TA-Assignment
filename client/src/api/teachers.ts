import { get, post } from './http';

export interface Teacher {
  name: string;
  subject: string;
  email: string;
  contactNumber: string;
}

export async function listTeachers(): Promise<Teacher[]> {
  const { data } = await get<{ data: Teacher[] }>('/teachers');
  return data;
}

export function createTeacher(teacher: Teacher): Promise<Teacher> {
  return post<Teacher>('/teachers', teacher);
}
