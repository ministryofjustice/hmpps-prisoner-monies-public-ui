import type { RequestHandler } from 'express'
import ANONYMOUS_USER from '../constants/audit'
import Page from '../constants/pages'

import type { Services } from '../services'

// helper function to
export default function auditPageViewRequest({ services, page }: { services: Services; page: Page }): RequestHandler {
  const { auditService } = services

  return async (req, _res, next) => {
    await auditService.logPageView(page, {
      correlationId: req.id,
      who: ANONYMOUS_USER,
    })

    next()
  }
}
