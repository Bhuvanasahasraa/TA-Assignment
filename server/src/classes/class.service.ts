import { ConflictError, NotFoundError } from '../errors';
import type { TeacherRepository } from '../teachers/teacher.repository';
import type { ClassRecord, ClassRepository } from './class.repository';
import type { CreateClassInput } from './class.schema';

export type ClassDto = ClassRecord;

export class ClassService {
  constructor(
    private readonly classes: ClassRepository,
    private readonly teachers: TeacherRepository,
  ) {}

  async create({ level, name, teacherEmail }: CreateClassInput): Promise<ClassDto> {
    const teacher = await this.teachers.findByEmail(teacherEmail);
    if (!teacher) {
      throw new NotFoundError(`No teacher found with email ${teacherEmail}`);
    }
    if (await this.classes.findByFormTeacherId(teacher.id)) {
      throw new ConflictError(`${teacher.name} is already the form teacher of another class`);
    }
    if (await this.classes.findByName(name)) {
      throw new ConflictError(`A class named ${name} already exists`);
    }
    return this.classes.create({ level, name, formTeacherId: teacher.id });
  }

  async list(): Promise<ClassDto[]> {
    return this.classes.findAll();
  }
}
