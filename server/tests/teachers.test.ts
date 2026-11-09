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

describe('Teachers API', () => {
  let app: Express;

  beforeEach(() => {
    app = createApp(createFakeDeps());
  });

  describe('GET /api/teachers', () => {
    it('returns an empty list when no teachers exist', async () => {
      const res = await request(app).get('/api/teachers');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: [] });
    });

    it('returns registered teachers in the spec shape', async () => {
      await request(app).post('/api/teachers').send(mary);
      const res = await request(app).get('/api/teachers');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: [mary] });
    });
  });

  describe('POST /api/teachers', () => {
    it('registers a teacher and responds 201', async () => {
      const res = await request(app).post('/api/teachers').send(mary);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(mary);
    });

    it('trims input and normalises email to lowercase', async () => {
      const res = await request(app)
        .post('/api/teachers')
        .send({ ...mary, name: '  Mary ', email: ' TeacherMary@Gmail.com ' });
      expect(res.status).toBe(201);
      expect(res.body).toEqual(mary);
    });

    it.each([
      ['name', { ...mary, name: '' }],
      ['subject', { ...mary, subject: 'Astrology' }],
      ['email', { ...mary, email: 'not-an-email' }],
      ['contactNumber', { ...mary, contactNumber: '1234' }],
      ['contactNumber', { ...mary, contactNumber: 68129414 }],
    ])('rejects an invalid %s with 400', async (_field, body) => {
      const res = await request(app).post('/api/teachers').send(body);
      expect(res.status).toBe(400);
      expect(typeof res.body.error).toBe('string');
    });

    it('rejects missing fields with 400', async () => {
      const res = await request(app).post('/api/teachers').send({ name: 'Mary' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/subject/i);
    });

    it('rejects unknown fields with 400', async () => {
      const res = await request(app).post('/api/teachers').send({ ...mary, isAdmin: true });
      expect(res.status).toBe(400);
    });

    it('rejects a duplicate email with 409', async () => {
      await request(app).post('/api/teachers').send(mary);
      const res = await request(app)
        .post('/api/teachers')
        .send({ ...mary, email: 'TEACHERMARY@gmail.com' });
      expect(res.status).toBe(409);
      expect(res.body).toEqual({ error: expect.stringMatching(/already/i) });
    });

    it('rejects malformed JSON with 400', async () => {
      const res = await request(app)
        .post('/api/teachers')
        .set('Content-Type', 'application/json')
        .send('{"name": "Mary",');
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: expect.any(String) });
    });

    it('rejects non-JSON content types with 415', async () => {
      const res = await request(app)
        .post('/api/teachers')
        .set('Content-Type', 'text/plain')
        .send('name=Mary');
      expect(res.status).toBe(415);
      expect(res.body).toEqual({ error: expect.any(String) });
    });
  });
});
