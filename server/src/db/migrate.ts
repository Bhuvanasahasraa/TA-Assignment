import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Pool } from 'pg';
import { loadConfig } from '../config';

const MIGRATIONS_DIR = path.resolve(__dirname, '../../migrations');

/** Applies each pending .sql file in /migrations once, in filename order, inside a transaction. */
async function migrate(): Promise<void> {
  const pool = new Pool({ connectionString: loadConfig().DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         name       TEXT PRIMARY KEY,
         applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
       )`,
    );
    const { rows } = await client.query<{ name: string }>('SELECT name FROM schema_migrations');
    const applied = new Set(rows.map((row) => row.name));
    const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files.filter((f) => !applied.has(f))) {
      const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`Applied migration ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }
    console.log('Database is up to date');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
