import type { Request, Response } from 'express'

import auditPageEventRequest from './auditPageEventRequest'
import ANONYMOUS_USER from '../constants/audit'
import { Services } from '../services'
import AuditEvent from '../constants/events'

describe('auditPageEventRequest', () => {
  const logAuditEvent = jest.fn()
  const next = jest.fn()

  const services = {
    auditService: { logAuditEvent },
  } as unknown as Services

  const req = { id: 'request123' } as unknown as Request
  const res = {} as unknown as Response

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('logs an audit event with the correlation id, anonymous user and event details', async () => {
    const eventDetails = { amount: 10 }

    await auditPageEventRequest({
      services,
      whatEvent: AuditEvent.AMOUNT_TO_VALIDATE,
      eventDetails,
    })(req, res, next)

    expect(logAuditEvent).toHaveBeenCalledWith({
      correlationId: 'request123',
      who: ANONYMOUS_USER,
      what: AuditEvent.AMOUNT_TO_VALIDATE,
      subjectType: 'NOT_APPLICABLE',
      details: eventDetails,
    })
  })

  it('calls next after logging the audit event', async () => {
    await auditPageEventRequest({
      services,
      whatEvent: AuditEvent.AMOUNT_TO_VALIDATE,
      eventDetails: {},
    })(req, res, next)

    expect(next).toHaveBeenCalled()
  })
})
