# School Admin – Teachers & Classes

A full-stack TypeScript application that lets administrators of a private education business register teachers, list them, create classes with a form teacher, and list classes.

| Layer    | Stack                                                                  |
| -------- | ---------------------------------------------------------------------- |
| Frontend | React 19, Vite, Ant Design 6, React Router                             |
| Backend  | Node.js, Express 5, Zod (validation), `pg` (parameterised SQL)         |
| Database | PostgreSQL 16 (Docker)                                                 |
| Tests    | Vitest, Supertest (API), Testing Library (UI)                          |

The task specification is in [`Full Stack Assignment.md`](./Full%20Stack%20Assignment.md).

## Hosted version

Not deployed yet. Instructions for running it locally are below.

---

## Running locally

### Prerequisites

- Node.js 20 or newer (developed on Node 24) and npm 10 or newer
- Docker Desktop (or any PostgreSQL 14+ instance)

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

This starts Postgres on `localhost:5433` (override with `POSTGRES_PORT`) with database, user, and password all set to `teacher_admin`. Those credentials are for local development only.

### 3. Configure the API

```bash
cp server/.env.example server/.env
```

| Variable       | Default                                                     | Purpose                                    |
| -------------- | ----------------------------------------------------------- | ------------------------------------------ |
| `PORT`         | `3000`                                                      | API port                                   |
| `DATABASE_URL` | `postgresql://teacher_admin:teacher_admin@localhost:5433/…` | Postgres connection string                 |
| `CORS_ORIGIN`  | `http://localhost:5173`                                     | Comma-separated browser origins to allow   |

### 4. Create the schema

```bash
npm run db:migrate
```

This applies the SQL files in `server/migrations/`. It's idempotent, so running it again is safe.

### 5. Run the app

```bash
npm run dev
```

- Web app: <http://localhost:5173>
- API: <http://localhost:3000/api>. The Vite dev server proxies `/api`, so the browser only talks to port 5173.

### Tests and checks

```bash
npm test          # server API tests + client UI tests
npm run typecheck # TypeScript across both workspaces
npm run build     # production builds (server → server/dist, client → client/dist)
```

The API tests run against `createApp()` with in-memory repositories, so they **don't need a database**.

### Production build

```bash
npm run build
node server/dist/index.js                 # API
# serve client/dist with any static host; set VITE_API_BASE_URL at build time if the API is on another origin
```

---

## API

All request bodies must be sent with `Content-Type: application/json`. Every error response has the shape `{ "error": "<message>" }`.

| Method | Path            | Success | Body / response                                                          |
| ------ | --------------- | ------- | ------------------------------------------------------------------------ |
| POST   | `/api/teachers` | 201     | `{ name, subject, email, contactNumber }` → the created teacher          |
| GET    | `/api/teachers` | 200     | `{ data: [{ name, subject, email, contactNumber }] }`                    |
| POST   | `/api/classes`  | 201     | `{ level, name, teacherEmail }` → `{ level, name, formTeacher: { name } }` |
| GET    | `/api/classes`  | 200     | `{ data: [{ level, name, formTeacher: { name } }] }`                     |

| Status | When                                                                                          |
| ------ | --------------------------------------------------------------------------------------------- |
| 400    | Malformed JSON, missing or unknown fields, or values that fail validation                     |
| 404    | `teacherEmail` doesn't match a registered teacher, or the route doesn't exist                 |
| 409    | Email already registered, teacher is already a form teacher, or the class name already exists |
| 413    | Request body is larger than 10 kB                                                             |
| 415    | A POST request without `Content-Type: application/json`                                       |
| 500    | Unexpected server error. Details are logged on the server and never returned to the client.   |

A Postman collection is in [`postman/teacher-admin.postman_collection.json`](./postman/teacher-admin.postman_collection.json).

---

## Project structure

```
├─ docker-compose.yml          PostgreSQL for local development
├─ postman/                    Postman collection
├─ server/
│  ├─ migrations/              Plain SQL schema migrations
│  ├─ src/
│  │  ├─ app.ts                createApp(deps): middleware, routes, error handling
│  │  ├─ index.ts              Wires Postgres repositories and starts the server
│  │  ├─ config.ts             Validated environment configuration
│  │  ├─ teachers/ classes/    Feature modules: schema → routes → service → repository
│  │  ├─ middleware/           JSON content-type guard, body validation, error handler
│  │  └─ db/                   Migration runner, Postgres error helpers
│  └─ tests/                   Supertest API tests with in-memory repositories
└─ client/
   ├─ src/
   │  ├─ api/                  Typed fetch wrappers that surface the API's `error` message
   │  ├─ pages/                Classes, Add Class, Teachers, Add Teacher
   │  ├─ components/           Page header, empty state, load error, form actions
   │  └─ layout/               App shell with top navigation
   └─ tests/                   Testing Library tests
```

Each feature module separates **routes** (HTTP), the **service** (business rules), and the **repository** (SQL). The repository interface is injected into `createApp`, so business rules can be tested without a database.

---

## Assumptions

1. **Subjects and levels are fixed lists**, presented as dropdowns in the UI:
   - Subjects: English Language, Mother Tongue Language, Mathematics, Science, Art, Music, Physical Education, Social Studies, Character and Citizenship Education
   - Levels: Primary 1 – Primary 6

   The API rejects any other value with a 400.
2. **Contact numbers are 8-digit Singapore numbers** (e.g. `68129414`) and are sent as strings. The UI displays them as `6812 9414`.
3. **Teacher email is the unique identifier.** It's trimmed and lowercased before storage and comparison, so `TeacherMary@Gmail.com` and `teachermary@gmail.com` are the same teacher.
4. **Class names are unique across the school**, compared case-insensitively. `Class 1A` and `class 1a` conflict.
5. **A teacher can be the form teacher of only one class.** This is enforced by the service and by a `UNIQUE` database constraint, which also covers concurrent requests.
6. An unknown `teacherEmail` returns **404**, because the referenced resource doesn't exist. Conflicts return **409**.
7. Request bodies are **strict**: unknown fields are rejected with 400 rather than silently ignored.
8. A successful `POST` returns the created resource in the same shape the corresponding `GET` list uses.
9. Lists are returned in creation order. Pagination wasn't required.
10. Login and access control are out of scope, as the brief states.

## Suggestions on the API design

- **Expose stable identifiers.** Responses have no `id`, so clients can't reference a teacher or class except by email or name. Returning an `id` (or a `Location` header on 201) would make updates and deletes possible later.
- **Include the form teacher's email** in `GET /api/classes`. A teacher's name isn't unique, so `formTeacher: { name }` alone is ambiguous.
- **Pagination and filtering** (`?page=&pageSize=`, `?subject=`) will be needed once the lists grow.
- **Machine-readable error codes**, e.g. `{ "error": "...", "code": "TEACHER_EMAIL_TAKEN" }`, would let clients react to errors without parsing messages.
- **Fix a typo in the spec:** the `POST /api/classes` example body is missing a comma after `"name": "Class 1A"`.
- **Version the API** (`/api/v1/...`) so breaking changes can ship without disrupting existing clients.
