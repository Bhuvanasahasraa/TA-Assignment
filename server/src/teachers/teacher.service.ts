import { ConflictError } from '../errors';
import type { CreateTeacherInput } from './teacher.schema';
import type { TeacherRecord, TeacherRepository } from './teacher.repository';

export interface TeacherDto {
  name: string;
  subject: string;
  email: string;
  contactNumber: string;
}

function toDto({ name, subject, email, contactNumber }: TeacherRecord): TeacherDto {
  return { name, subject, email, contactNumber };
}

export class TeacherService {
  constructor(private readonly teachers: TeacherRepository) {}

  async register(input: CreateTeacherInput): Promise<TeacherDto> {
    if (await this.teachers.findByEmail(input.email)) {
      throw new ConflictError(`A teacher with email ${input.email} already exists`);
    }
    return toDto(await this.teachers.create(input));
  }

  async list(): Promise<TeacherDto[]> {
    return (await this.teachers.findAll()).map(toDto);
  }
}
