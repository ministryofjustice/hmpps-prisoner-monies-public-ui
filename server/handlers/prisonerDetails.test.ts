import type { NextFunction, Request, Response } from 'express'
import {
  prisonerDetailsGetHandler,
  prisonerDetailsPostHandler,
  PRISONER_DETAILS_BACK_LINK_HREF,
} from './prisonerDetails'
import SendMoneyToPrisonerService from '../services/sendMoneyToPrisonerService'

import makeRes from '../testutils/mockResponse'

jest.mock('../services/sendMoneyToPrisonerService')

const next = jest.fn() as unknown as NextFunction

const validFormBody = {
  prisoner_name: 'John Smith',
  prisoner_dob_0: '1',
  prisoner_dob_1: '2',
  prisoner_dob_2: '1990',
  prisoner_number: 'A1234BC',
}

describe('prisonerDetailsGetHandler', () => {
  it('renders the prisoner details page with empty form values and errors', () => {
    const req = {} as unknown as Request
    const { res, render } = makeRes()

    prisonerDetailsGetHandler(req, res as unknown as Response, next)

    expect(render).toHaveBeenCalledWith('pages/prisoner-details', {
      backLinkHref: PRISONER_DETAILS_BACK_LINK_HREF,
      postDebitCardDetails: res.locals.localePath('/debit-card/details'),
      errors: {},
      errorList: [],
      formValues: {},
    })
  })
})

describe('prisonerDetailsPostHandler', () => {
  let sendMoneyToPrisonerService: jest.Mocked<SendMoneyToPrisonerService>

  beforeEach(() => {
    sendMoneyToPrisonerService = new SendMoneyToPrisonerService() as jest.Mocked<SendMoneyToPrisonerService>
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('re-renders with validation errors when the form is invalid', async () => {
    const req = { body: {} } as unknown as Request
    const { res, render, redirect } = makeRes()

    const handler = prisonerDetailsPostHandler(sendMoneyToPrisonerService)
    await handler(req, res as unknown as Response, next)

    expect(render).toHaveBeenCalledWith(
      'pages/prisoner-details',
      expect.objectContaining({ backLinkHref: PRISONER_DETAILS_BACK_LINK_HREF }),
    )
    expect(sendMoneyToPrisonerService.getValidPrisoner).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('redirects to the amount page when the prisoner is valid', async () => {
    sendMoneyToPrisonerService.getValidPrisoner.mockResolvedValue({
      prisonerNumber: validFormBody.prisoner_number,
      prisonerDOB: '1990-2-1',
    })
    const req = { body: validFormBody } as unknown as Request
    const { res, redirect, render } = makeRes()

    const handler = prisonerDetailsPostHandler(sendMoneyToPrisonerService)
    await handler(req, res as unknown as Response, next)

    expect(sendMoneyToPrisonerService.getValidPrisoner).toHaveBeenCalledWith('A1234BC', '1990-2-1')
    expect(redirect).toHaveBeenCalledWith('/debit-card/amount')
    expect(render).not.toHaveBeenCalled()
  })

  it('re-renders with no field errors when the prisoner cannot be found', async () => {
    sendMoneyToPrisonerService.getValidPrisoner.mockResolvedValue(undefined as never)
    const req = { body: validFormBody } as unknown as Request
    const { res, render, redirect } = makeRes()

    const handler = prisonerDetailsPostHandler(sendMoneyToPrisonerService)
    await handler(req, res as unknown as Response, next)

    expect(render).toHaveBeenCalledWith('pages/prisoner-details', {
      backLinkHref: PRISONER_DETAILS_BACK_LINK_HREF,
      postDebitCardDetails: res.locals.localePath('/debit-card/details'),
      errors: {},
      errorList: [],
      formValues: {
        prisonerName: validFormBody.prisoner_name,
        prisonerDobDay: validFormBody.prisoner_dob_0,
        prisonerDobMonth: validFormBody.prisoner_dob_1,
        prisonerDobYear: validFormBody.prisoner_dob_2,
        prisonerNumber: validFormBody.prisoner_number,
      },
    })
    expect(redirect).not.toHaveBeenCalled()
  })
})
