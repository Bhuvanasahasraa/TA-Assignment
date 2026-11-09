import { Router } from 'express';
import { validateBody } from '../middleware/validateBody';
import { createTeacherSchema, type CreateTeacherInput } from './teacher.schema';
import type { TeacherService } from './teacher.service';

export function teacherRoutes(service: TeacherService): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    res.status(200).json({ data: await service.list() });
  });

  router.post('/', validateBody(createTeacherSchema), async (req, res) => {
    const teacher = await service.register(req.body as CreateTeacherInput);
    res.status(201).json(teacher);
  });

  return router;
}
