import type { ClassRecord, ClassRepository, NewClass } from '../../src/classes/class.repository';
import type { NewTeacher, TeacherRecord, TeacherRepository } from '../../src/teachers/teacher.repository';

export class InMemoryTeacherRepository implements TeacherRepository {
  private teachers: TeacherRecord[] = [];

  async create(input: NewTeacher): Promise<TeacherRecord> {
    const teacher = { id: this.teachers.length + 1, ...input };
    this.teachers.push(teacher);
    return teacher;
  }

  async findAll(): Promise<TeacherRecord[]> {
    return [...this.teachers];
  }

  async findByEmail(email: string): Promise<TeacherRecord | null> {
    return this.teachers.find((t) => t.email === email) ?? null;
  }
}

export class InMemoryClassRepository implements ClassRepository {
  private classes: (NewClass & { id: number })[] = [];

  constructor(private readonly teachers: InMemoryTeacherRepository) {}

  async create(input: NewClass): Promise<ClassRecord> {
    const record = { id: this.classes.length + 1, ...input };
    this.classes.push(record);
    return this.withTeacher(record);
  }

  async findAll(): Promise<ClassRecord[]> {
    return Promise.all(this.classes.map((c) => this.withTeacher(c)));
  }

  async findByName(name: string): Promise<{ id: number } | null> {
    return this.classes.find((c) => c.name.toLowerCase() === name.toLowerCase()) ?? null;
  }

  async findByFormTeacherId(teacherId: number): Promise<{ id: number } | null> {
    return this.classes.find((c) => c.formTeacherId === teacherId) ?? null;
  }

  private async withTeacher(record: NewClass & { id: number }): Promise<ClassRecord> {
    const teacher = (await this.teachers.findAll()).find((t) => t.id === record.formTeacherId);
    if (!teacher) throw new Error('Teacher missing in fake repository');
    return { level: record.level, name: record.name, formTeacher: { name: teacher.name } };
  }
}

export function createFakeDeps() {
  const teacherRepository = new InMemoryTeacherRepository();
  const classRepository = new InMemoryClassRepository(teacherRepository);
  return { teacherRepository, classRepository };
}
