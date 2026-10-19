import type { NextFunction, Request, Response } from 'express'
import {
  prisonerDetailsGetHandler,
  prisonerDetailsPostHandler,
  PRISONER_DETAILS_BACK_LINK_HREF,
} from './prisonerDetails'
import SendMoneyToPrisonerService from '../services/sendMoneyToPrisonerService'
import { debitCardPaths } from '../constants/paths'

import makeRes from '../testutils/mockResponse'
import i18next, { i18nextInitPromise } from '../i18n/i18n'

jest.mock('../services/sendMoneyToPrisonerService')

beforeAll(() => i18nextInitPromise)

const next = jest.fn() as unknown as NextFunction

const validFormBody = {
  prisoner_name: 'John Smith',
  prisoner_dob_0: '1',
  prisoner_dob_1: '2',
  prisoner_dob_2: '1990',
  prisoner_number: 'A1234BC',
}

const expectedPrisonerDOB = `${validFormBody.prisoner_dob_0}-${validFormBody.prisoner_dob_1}-${validFormBody.prisoner_dob_2}`

describe('prisonerDetailsGetHandler', () => {
  it('renders the prisoner details page with empty form values and errors', () => {
    const req = {} as unknown as Request
    const { res, render } = makeRes()

    prisonerDetailsGetHandler(req, res as unknown as Response, next)

    expect(render).toHaveBeenCalledWith('pages/prisoner-details', {
      backLinkHref: PRISONER_DETAILS_BACK_LINK_HREF,
      postDebitCardDetails: res.locals.localePath(debitCardPaths.PRISONER_DETAILS),
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
    res.locals.t = i18next.getFixedT('en-gb')

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
      prisonerDOB: expectedPrisonerDOB,
    })
    const req = { body: validFormBody } as unknown as Request
    const { res, redirect, render } = makeRes()
    res.locals.t = i18next.getFixedT('en-gb')

    const handler = prisonerDetailsPostHandler(sendMoneyToPrisonerService)
    await handler(req, res as unknown as Response, next)

    expect(sendMoneyToPrisonerService.getValidPrisoner).toHaveBeenCalledWith(
      validFormBody.prisoner_number,
      expectedPrisonerDOB,
    )
    expect(redirect).toHaveBeenCalledWith(debitCardPaths.PAYMENT_AMOUNT)
    expect(render).not.toHaveBeenCalled()
  })

  it('stores the prisoner details in the session when the prisoner is valid', async () => {
    sendMoneyToPrisonerService.getValidPrisoner.mockResolvedValue({
      prisonerNumber: validFormBody.prisoner_number,
      prisonerDOB: expectedPrisonerDOB,
    })
    const req = { body: validFormBody, session: {} } as unknown as Request
    const { res } = makeRes()

    const handler = prisonerDetailsPostHandler(sendMoneyToPrisonerService)
    await handler(req, res as unknown as Response, next)

    expect(req.session.sendMoney?.prisonerName).toBe(validFormBody.prisoner_name)
    expect(req.session.sendMoney?.prisonerDOB).toBe(expectedPrisonerDOB)
    expect(req.session.sendMoney?.prisonerNumber).toBe(validFormBody.prisoner_number)
  })

  it('preserves other sendMoney session values already stored (e.g. amount)', async () => {
    sendMoneyToPrisonerService.getValidPrisoner.mockResolvedValue({
      prisonerNumber: validFormBody.prisoner_number,
      prisonerDOB: expectedPrisonerDOB,
    })
    const req = {
      body: validFormBody,
      session: { sendMoney: { amount: '10.00' } },
    } as unknown as Request
    const { res } = makeRes()

    const handler = prisonerDetailsPostHandler(sendMoneyToPrisonerService)
    await handler(req, res as unknown as Response, next)

    expect(req.session.sendMoney).toEqual({
      amount: '10.00',
      prisonerName: validFormBody.prisoner_name,
      prisonerDOB: expectedPrisonerDOB,
      prisonerNumber: validFormBody.prisoner_number,
    })
  })

  it('re-renders with no field errors when the prisoner cannot be found', async () => {
    sendMoneyToPrisonerService.getValidPrisoner.mockResolvedValue(undefined as never)
    const req = { body: validFormBody } as unknown as Request
    const { res, render, redirect } = makeRes()
    res.locals.t = i18next.getFixedT('en-gb')

    const handler = prisonerDetailsPostHandler(sendMoneyToPrisonerService)
    await handler(req, res as unknown as Response, next)

    expect(render).toHaveBeenCalledWith('pages/prisoner-details', {
      backLinkHref: PRISONER_DETAILS_BACK_LINK_HREF,
      postDebitCardDetails: res.locals.localePath(debitCardPaths.PRISONER_DETAILS),
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
