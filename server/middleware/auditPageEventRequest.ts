import type { RequestHandler } from 'express'
import ANONYMOUS_USER from '../constants/audit'
import type { Services } from '../services'
import AuditEvent from '../constants/events'

// helper function to
export default function auditPageEventRequest({
  services,
  whatEvent,
  eventDetails,
}: {
  services: Services
  whatEvent: AuditEvent
  eventDetails: Record<string, unknown>
}): RequestHandler {
  const { auditService } = services

  return async (req, _res, next) => {
    await auditService.logAuditEvent({
      correlationId: req.id,
      who: ANONYMOUS_USER,
      what: whatEvent,
      subjectType: 'NOT_APPLICABLE',
      details: eventDetails,
    })

    next()
  }
}
