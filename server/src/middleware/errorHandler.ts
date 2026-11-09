import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError } from '../errors';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
};

/** Body-parser errors carry an HTTP status and a `type` such as "entity.parse.failed". */
function isBodyParserError(err: unknown): err is { status: number; type: string } {
  return typeof err === 'object' && err !== null && 'type' in err && 'status' in err;
}

const BODY_PARSER_MESSAGES: Record<string, string> = {
  'entity.parse.failed': 'Request body contains malformed JSON',
  'entity.too.large': 'Request body is too large',
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (isBodyParserError(err) && err.status >= 400 && err.status < 500) {
    res.status(err.status).json({ error: BODY_PARSER_MESSAGES[err.type] ?? 'Invalid request body' });
    return;
  }

  // Unexpected failure: log details server-side, never leak them to the client.
  console.error(err);
  res.status(500).json({ error: 'An unexpected error occurred' });
};
