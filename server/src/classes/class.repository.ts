import type { Pool } from 'pg';
import { isUniqueViolation } from '../db/errors';
import { ConflictError } from '../errors';

export interface NewClass {
  level: string;
  name: string;
  formTeacherId: number;
}

export interface ClassRecord {
  level: string;
  name: string;
  formTeacher: { name: string };
}

export interface ClassRepository {
  create(input: NewClass): Promise<ClassRecord>;
  findAll(): Promise<ClassRecord[]>;
  /** Case-insensitive lookup. */
  findByName(name: string): Promise<{ id: number } | null>;
  findByFormTeacherId(teacherId: number): Promise<{ id: number } | null>;
}

interface ClassRow {
  level: string;
  name: string;
  teacherName: string;
}

function toRecord({ level, name, teacherName }: ClassRow): ClassRecord {
  return { level, name, formTeacher: { name: teacherName } };
}

export class PgClassRepository implements ClassRepository {
  constructor(private readonly pool: Pool) {}

  async create({ level, name, formTeacherId }: NewClass): Promise<ClassRecord> {
    try {
      const { rows } = await this.pool.query<ClassRow>(
        `WITH inserted AS (
           INSERT INTO classes (level, name, form_teacher_id)
           VALUES ($1, $2, $3)
           RETURNING level, name, form_teacher_id
         )
         SELECT inserted.level, inserted.name, t.name AS "teacherName"
         FROM inserted JOIN teachers t ON t.id = inserted.form_teacher_id`,
        [level, name, formTeacherId],
      );
      return toRecord(rows[0]);
    } catch (err) {
      // Database constraints back up the service-level checks under concurrent requests.
      if (isUniqueViolation(err, 'classes_form_teacher_id_key')) {
        throw new ConflictError('This teacher is already the form teacher of another class');
      }
      if (isUniqueViolation(err, 'classes_name_lower_key')) {
        throw new ConflictError(`A class named ${name} already exists`);
      }
      throw err;
    }
  }

  async findAll(): Promise<ClassRecord[]> {
    const { rows } = await this.pool.query<ClassRow>(
      `SELECT c.level, c.name, t.name AS "teacherName"
       FROM classes c JOIN teachers t ON t.id = c.form_teacher_id
       ORDER BY c.created_at, c.id`,
    );
    return rows.map(toRecord);
  }

  async findByName(name: string): Promise<{ id: number } | null> {
    const { rows } = await this.pool.query<{ id: number }>(
      'SELECT id FROM classes WHERE lower(name) = lower($1)',
      [name],
    );
    return rows[0] ?? null;
  }

  async findByFormTeacherId(teacherId: number): Promise<{ id: number } | null> {
    const { rows } = await this.pool.query<{ id: number }>(
      'SELECT id FROM classes WHERE form_teacher_id = $1',
      [teacherId],
    );
    return rows[0] ?? null;
  }
}
