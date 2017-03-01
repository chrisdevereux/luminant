import { RequestHandler } from 'express'

export interface Compose {
  (...middlewares: RequestHandler[]): RequestHandler
}

export const composeMiddleware: Compose = require('compose-middleware').compose
