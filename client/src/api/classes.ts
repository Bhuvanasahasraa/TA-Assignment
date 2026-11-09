import { get, post } from './http';

export interface SchoolClass {
  level: string;
  name: string;
  formTeacher: { name: string };
}

export interface NewSchoolClass {
  level: string;
  name: string;
  teacherEmail: string;
}

export async function listClasses(): Promise<SchoolClass[]> {
  const { data } = await get<{ data: SchoolClass[] }>('/classes');
  return data;
}

export function createClass(schoolClass: NewSchoolClass): Promise<SchoolClass> {
  return post<SchoolClass>('/classes', schoolClass);
}
