import type { Request, Response, NextFunction } from 'express'
import type { HTTPError } from 'superagent'
import logger from '../logger'
import { detectLocaleFromPath, buildLocalePath } from './utils/locale'

export default function createErrorHandler(production: boolean) {
  return (error: HTTPError, req: Request, res: Response, _next: NextFunction): void => {
    logger.error(`Error handling request for '${req.originalUrl}', user '${res.locals.user?.username}'`, error)

    if (error.status === 401 || error.status === 403) {
      logger.info('Logging user out')
      return res.redirect('/sign-out')
    }

    res.locals.message = production
      ? 'Something went wrong. The error has been logged. Please try again'
      : error.message
    res.locals.status = error.status
    res.locals.stack = production ? null : error.stack

    // has it already been set from middleware
    // this is a fallback to make sure Error pages have correct translations
    if (!res.locals.localePath) {
      const locale = detectLocaleFromPath(req.originalUrl)
      res.locals.locale = locale
      res.locals.localePath = (path: string) => buildLocalePath(locale, path)
    }

    res.status(error.status || 500)

    return res.render('pages/error')
  }
}
