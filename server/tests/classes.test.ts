import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Express } from 'express';
import { createApp } from '../src/app';
import { createFakeDeps } from './support/inMemoryRepositories';

const mary = {
  name: 'Mary',
  subject: 'Mathematics',
  email: 'teachermary@gmail.com',
  contactNumber: '68129414',
};
const ken = {
  name: 'Ken',
  subject: 'Mother Tongue Language',
  email: 'teacherken@gmail.com',
  contactNumber: '61824191',
};
const class1A = { level: 'Primary 1', name: 'Class 1A', teacherEmail: mary.email };

describe('Classes API', () => {
  let app: Express;

  beforeEach(async () => {
    app = createApp(createFakeDeps());
    await request(app).post('/api/teachers').send(mary);
    await request(app).post('/api/teachers').send(ken);
  });

  describe('GET /api/classes', () => {
    it('returns an empty list when no classes exist', async () => {
      const res = await request(app).get('/api/classes');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: [] });
    });

    it('returns classes with their form teacher name', async () => {
      await request(app).post('/api/classes').send(class1A);
      await request(app)
        .post('/api/classes')
        .send({ level: 'Primary 2', name: 'Class 2B', teacherEmail: ken.email });

      const res = await request(app).get('/api/classes');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        data: [
          { level: 'Primary 1', name: 'Class 1A', formTeacher: { name: 'Mary' } },
          { level: 'Primary 2', name: 'Class 2B', formTeacher: { name: 'Ken' } },
        ],
      });
    });
  });

  describe('POST /api/classes', () => {
    it('creates a class and responds 201', async () => {
      const res = await request(app).post('/api/classes').send(class1A);
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ level: 'Primary 1', name: 'Class 1A', formTeacher: { name: 'Mary' } });
    });

    it('matches the teacher email case-insensitively', async () => {
      const res = await request(app)
        .post('/api/classes')
        .send({ ...class1A, teacherEmail: 'TeacherMary@GMAIL.com' });
      expect(res.status).toBe(201);
    });

    it.each([
      ['level', { ...class1A, level: 'Secondary 9' }],
      ['name', { ...class1A, name: '   ' }],
      ['teacherEmail', { ...class1A, teacherEmail: 'nope' }],
    ])('rejects an invalid %s with 400', async (_field, body) => {
      const res = await request(app).post('/api/classes').send(body);
      expect(res.status).toBe(400);
      expect(typeof res.body.error).toBe('string');
    });

    it('responds 404 when the teacher does not exist', async () => {
      const res = await request(app)
        .post('/api/classes')
        .send({ ...class1A, teacherEmail: 'ghost@gmail.com' });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: expect.stringMatching(/teacher/i) });
    });

    it('rejects a teacher who is already a form teacher with 409', async () => {
      await request(app).post('/api/classes').send(class1A);
      const res = await request(app)
        .post('/api/classes')
        .send({ level: 'Primary 2', name: 'Class 2A', teacherEmail: mary.email });
      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/form teacher/i);
    });

    it('rejects a duplicate class name with 409', async () => {
      await request(app).post('/api/classes').send(class1A);
      const res = await request(app)
        .post('/api/classes')
        .send({ ...class1A, name: 'class 1a', teacherEmail: ken.email });
      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/class/i);
    });
  });
});

describe('Unknown routes', () => {
  it('responds 404 with a JSON error', async () => {
    const res = await request(createApp(createFakeDeps())).get('/api/unknown');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: expect.any(String) });
  });
});
