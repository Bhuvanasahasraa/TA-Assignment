import { Pool } from 'pg';
import { createApp } from './app';
import { PgClassRepository } from './classes/class.repository';
import { loadConfig } from './config';
import { PgTeacherRepository } from './teachers/teacher.repository';

const config = loadConfig();
const pool = new Pool({ connectionString: config.DATABASE_URL });

const app = createApp({
  teacherRepository: new PgTeacherRepository(pool),
  classRepository: new PgClassRepository(pool),
  corsOrigin: config.CORS_ORIGIN,
});

const server = app.listen(config.PORT, () => {
  console.log(`API listening on http://localhost:${config.PORT}`);
});

function shutdown(): void {
  server.close(() => {
    pool.end().finally(() => process.exit(0));
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
