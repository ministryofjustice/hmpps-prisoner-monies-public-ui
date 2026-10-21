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
    expect(sendMoneyToPrisonerService.isPrisonerKnown).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('redirects to the amount page when the prisoner is valid', async () => {
    sendMoneyToPrisonerService.isPrisonerKnown.mockResolvedValue(true)
    const req = { body: validFormBody } as unknown as Request
    const { res, redirect, render } = makeRes()
    res.locals.t = i18next.getFixedT('en-gb')

    const handler = prisonerDetailsPostHandler(sendMoneyToPrisonerService)
    await handler(req, res as unknown as Response, next)

    expect(sendMoneyToPrisonerService.isPrisonerKnown).toHaveBeenCalledWith(
      validFormBody.prisoner_number,
      expectedPrisonerDOB,
    )
    expect(redirect).toHaveBeenCalledWith(debitCardPaths.PAYMENT_AMOUNT)
    expect(render).not.toHaveBeenCalled()
  })

  it('stores the prisoner details in the session when the prisoner is valid', async () => {
    sendMoneyToPrisonerService.isPrisonerKnown.mockResolvedValue(true)
    const req = { body: validFormBody, session: {} } as unknown as Request
    const { res } = makeRes()

    const handler = prisonerDetailsPostHandler(sendMoneyToPrisonerService)
    await handler(req, res as unknown as Response, next)

    expect(req.session.sendMoney?.prisonerName).toBe(validFormBody.prisoner_name)
    expect(req.session.sendMoney?.prisonerDOB).toBe(expectedPrisonerDOB)
    expect(req.session.sendMoney?.prisonerNumber).toBe(validFormBody.prisoner_number)
  })

  it('preserves other sendMoney session values already stored (e.g. amount)', async () => {
    sendMoneyToPrisonerService.isPrisonerKnown.mockResolvedValue(true)
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
    sendMoneyToPrisonerService.isPrisonerKnown.mockResolvedValue(false)
    const req = { body: validFormBody } as unknown as Request
    const { res, render, redirect } = makeRes()
    res.locals.t = i18next.getFixedT('en-gb')

    const handler = prisonerDetailsPostHandler(sendMoneyToPrisonerService)
    await handler(req, res as unknown as Response, next)

    expect(render).toHaveBeenCalledWith('pages/prisoner-details', {
      backLinkHref: PRISONER_DETAILS_BACK_LINK_HREF,
      postDebitCardDetails: res.locals.localePath(debitCardPaths.PRISONER_DETAILS),
      errors: {},
      errorList: [
        expect.objectContaining({
          messages: ['No prisoner matches the details you’ve supplied'],
        }),
      ],
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

  it('redisplays the raw submitted prisoner name (untrimmed) when the prisoner cannot be found', async () => {
    sendMoneyToPrisonerService.isPrisonerKnown.mockResolvedValue(false)
    const req = { body: { ...validFormBody, prisoner_name: '  John Smith  ' } } as unknown as Request
    const { res, render } = makeRes()
    res.locals.t = i18next.getFixedT('en-gb')

    const handler = prisonerDetailsPostHandler(sendMoneyToPrisonerService)
    await handler(req, res as unknown as Response, next)

    expect(render).toHaveBeenCalledWith(
      'pages/prisoner-details',
      expect.objectContaining({
        formValues: expect.objectContaining({ prisonerName: '  John Smith  ' }),
      }),
    )
  })

  describe('prisoner number normalisation', () => {
    it('uppercases a lowercase prisoner number before looking up the prisoner', async () => {
      sendMoneyToPrisonerService.isPrisonerKnown.mockResolvedValue(true)
      const req = {
        body: { ...validFormBody, prisoner_number: 'a1234bc' },
      } as unknown as Request
      const { res } = makeRes()
      res.locals.t = i18next.getFixedT('en-gb')

      const handler = prisonerDetailsPostHandler(sendMoneyToPrisonerService)
      await handler(req, res as unknown as Response, next)

      expect(sendMoneyToPrisonerService.isPrisonerKnown).toHaveBeenCalledWith('A1234BC', expectedPrisonerDOB)
    })

    it('trims whitespace before storing it in the session', async () => {
      sendMoneyToPrisonerService.isPrisonerKnown.mockResolvedValue(true)
      const req = {
        body: { ...validFormBody, prisoner_number: '  a1234Bc  ' },
        session: {},
      } as unknown as Request
      const { res } = makeRes()
      res.locals.t = i18next.getFixedT('en-gb')

      const handler = prisonerDetailsPostHandler(sendMoneyToPrisonerService)
      await handler(req, res as unknown as Response, next)

      expect(req.session.sendMoney?.prisonerNumber).toBe('A1234BC')
    })

    it('redisplays the prisoner number exactly as typed (not uppercased) when the prisoner cannot be found', async () => {
      // Matches legacy: an invalid/rejected Django form always redisplays the raw
      // submitted POST data, never the cleaned_data used for the lookup.
      sendMoneyToPrisonerService.isPrisonerKnown.mockResolvedValue(false)
      const req = {
        body: { ...validFormBody, prisoner_number: 'a1234bc' },
      } as unknown as Request
      const { res, render } = makeRes()
      res.locals.t = i18next.getFixedT('en-gb')

      const handler = prisonerDetailsPostHandler(sendMoneyToPrisonerService)
      await handler(req, res as unknown as Response, next)

      expect(sendMoneyToPrisonerService.isPrisonerKnown).toHaveBeenCalledWith('A1234BC', expectedPrisonerDOB)
      expect(render).toHaveBeenCalledWith(
        'pages/prisoner-details',
        expect.objectContaining({
          formValues: expect.objectContaining({ prisonerNumber: 'a1234bc' }),
        }),
      )
    })

    it('still rejects an invalid prisoner number format once normalised, without looking it up', async () => {
      const req = { body: { ...validFormBody, prisoner_number: 'a123bc' } } as unknown as Request
      const { res, render } = makeRes()
      res.locals.t = i18next.getFixedT('en-gb')

      const handler = prisonerDetailsPostHandler(sendMoneyToPrisonerService)
      await handler(req, res as unknown as Response, next)

      expect(sendMoneyToPrisonerService.isPrisonerKnown).not.toHaveBeenCalled()
      expect(render).toHaveBeenCalledWith(
        'pages/prisoner-details',
        expect.objectContaining({
          errorList: expect.arrayContaining([expect.objectContaining({ href: '#id_prisoner_number' })]),
        }),
      )
    })
  })

  describe('prisoner name normalisation', () => {
    it('trims leading and trailing whitespace from the prisoner name before storing it in the session', async () => {
      sendMoneyToPrisonerService.isPrisonerKnown.mockResolvedValue(true)
      const req = {
        body: { ...validFormBody, prisoner_name: '  John Smith  ' },
        session: {},
      } as unknown as Request
      const { res } = makeRes()
      res.locals.t = i18next.getFixedT('en-gb')

      const handler = prisonerDetailsPostHandler(sendMoneyToPrisonerService)
      await handler(req, res as unknown as Response, next)

      expect(req.session.sendMoney?.prisonerName).toBe('John Smith')
    })
  })
})
