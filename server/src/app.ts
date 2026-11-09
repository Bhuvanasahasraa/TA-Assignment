import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { ClassService } from './classes/class.service';
import { classRoutes } from './classes/class.routes';
import type { ClassRepository } from './classes/class.repository';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requireJson } from './middleware/requireJson';
import { TeacherService } from './teachers/teacher.service';
import { teacherRoutes } from './teachers/teacher.routes';
import type { TeacherRepository } from './teachers/teacher.repository';

export interface AppDependencies {
  teacherRepository: TeacherRepository;
  classRepository: ClassRepository;
  /** Allowed browser origin(s). Omit to disable cross-origin requests. */
  corsOrigin?: string | string[];
}

export function createApp({ teacherRepository, classRepository, corsOrigin }: AppDependencies): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: corsOrigin ?? false }));
  app.use('/api', requireJson);
  app.use(express.json({ limit: '10kb' }));

  app.use('/api/teachers', teacherRoutes(new TeacherService(teacherRepository)));
  app.use('/api/classes', classRoutes(new ClassService(classRepository, teacherRepository)));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
