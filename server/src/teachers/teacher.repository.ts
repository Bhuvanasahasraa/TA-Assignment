import type { Pool } from 'pg';
import { isUniqueViolation } from '../db/errors';
import { ConflictError } from '../errors';

export interface NewTeacher {
  name: string;
  subject: string;
  email: string;
  contactNumber: string;
}

export interface TeacherRecord extends NewTeacher {
  id: number;
}

export interface TeacherRepository {
  create(input: NewTeacher): Promise<TeacherRecord>;
  findAll(): Promise<TeacherRecord[]>;
  findByEmail(email: string): Promise<TeacherRecord | null>;
}

const COLUMNS = 'id, name, subject, email, contact_number AS "contactNumber"';

export class PgTeacherRepository implements TeacherRepository {
  constructor(private readonly pool: Pool) {}

  async create({ name, subject, email, contactNumber }: NewTeacher): Promise<TeacherRecord> {
    try {
      const { rows } = await this.pool.query<TeacherRecord>(
        `INSERT INTO teachers (name, subject, email, contact_number)
         VALUES ($1, $2, $3, $4)
         RETURNING ${COLUMNS}`,
        [name, subject, email, contactNumber],
      );
      return rows[0];
    } catch (err) {
      // Covers the race where two requests register the same email concurrently.
      if (isUniqueViolation(err, 'teachers_email_key')) {
        throw new ConflictError(`A teacher with email ${email} already exists`);
      }
      throw err;
    }
  }

  async findAll(): Promise<TeacherRecord[]> {
    const { rows } = await this.pool.query<TeacherRecord>(
      `SELECT ${COLUMNS} FROM teachers ORDER BY created_at, id`,
    );
    return rows;
  }

  async findByEmail(email: string): Promise<TeacherRecord | null> {
    const { rows } = await this.pool.query<TeacherRecord>(
      `SELECT ${COLUMNS} FROM teachers WHERE email = $1`,
      [email],
    );
    return rows[0] ?? null;
  }
}
