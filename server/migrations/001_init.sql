CREATE TABLE IF NOT EXISTS teachers (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  subject        VARCHAR(100) NOT NULL,
  email          VARCHAR(254) NOT NULL UNIQUE,
  contact_number VARCHAR(8)   NOT NULL,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS classes (
  id              SERIAL PRIMARY KEY,
  level           VARCHAR(20) NOT NULL,
  name            VARCHAR(50) NOT NULL,
  -- UNIQUE enforces "a teacher can only be the form teacher of one class"
  form_teacher_id INTEGER     NOT NULL UNIQUE REFERENCES teachers (id) ON DELETE RESTRICT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS classes_name_lower_key ON classes (lower(name));
