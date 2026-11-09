import type { RequestHandler } from 'express';
import { UnsupportedMediaTypeError } from '../errors';

const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH']);

export const requireJson: RequestHandler = (req, _res, next) => {
  if (METHODS_WITH_BODY.has(req.method) && !req.is('application/json')) {
    throw new UnsupportedMediaTypeError('Content-Type must be application/json');
  }
  next();
};
