import type { Request, Response } from 'express'

import auditPageViewRequest from './auditPageViewRequest'
import ANONYMOUS_USER from '../constants/audit'
import { Services } from '../services'
import Page from '../constants/pages'

describe('auditPageViewRequest', () => {
  const logPageView = jest.fn()
  const next = jest.fn()

  const services = {
    auditService: { logPageView },
  } as unknown as Services

  const req = { id: 'request123' } as unknown as Request
  const res = {} as unknown as Response

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('logs a page view event with the correlation id and anonymous user', async () => {
    await auditPageViewRequest({ services, page: Page.START })(req, res, next)

    expect(logPageView).toHaveBeenCalledWith(Page.START, {
      correlationId: 'request123',
      who: ANONYMOUS_USER,
    })
  })

  it('calls next after logging the page view event', async () => {
    await auditPageViewRequest({ services, page: Page.START })(req, res, next)

    expect(next).toHaveBeenCalled()
  })
})
