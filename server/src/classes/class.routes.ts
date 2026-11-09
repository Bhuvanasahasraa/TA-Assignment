import { Router } from 'express';
import { validateBody } from '../middleware/validateBody';
import { createClassSchema, type CreateClassInput } from './class.schema';
import type { ClassService } from './class.service';

export function classRoutes(service: ClassService): Router {
  const router = Router();

  router.get('/', async (_req, res) => {
    res.status(200).json({ data: await service.list() });
  });

  router.post('/', validateBody(createClassSchema), async (req, res) => {
    const created = await service.create(req.body as CreateClassInput);
    res.status(201).json(created);
  });

  return router;
}
