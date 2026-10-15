import type { NextFunction, Request, Response } from 'express'
import { paymentAmountGetHandler, paymentAmountPostHandler } from './paymentAmount'
import makeRes from '../testutils/mockResponse'
import i18next, { i18nextInitPromise } from '../i18n/i18n'

beforeAll(() => i18nextInitPromise)

const next = jest.fn() as unknown as NextFunction

describe('paymentAmountGetHandler', () => {
  it('renders the payment amount page with empty form values and errors', () => {
    const req = {} as unknown as Request
    const { res, render } = makeRes()

    paymentAmountGetHandler(req, res as unknown as Response, next)

    expect(render).toHaveBeenCalledWith('pages/payment-amount', {
      postPaymentAmount: res.locals.localePath('/debit-card/amount'),
      errors: {},
      errorList: [],
      formValues: {},
    })
  })
})

describe('paymentAmountPostHandler error handling', () => {
  it('re-renders with validation errors when the form is invalid', async () => {
    const req = { body: {} } as unknown as Request
    const { res, render, redirect } = makeRes()
    res.locals.t = i18next.getFixedT('en-gb')
    const handler = paymentAmountPostHandler()
    await handler(req, res as unknown as Response, next)

    expect(render).toHaveBeenCalledWith(
      'pages/payment-amount',
      expect.objectContaining({ errors: { amount: 'This field is required.' } }),
    )
    expect(redirect).not.toHaveBeenCalled()
  })

  it('preserves the entered value in formValues when the amount is invalid', async () => {
    const req = { body: { amount: 'abc' } } as unknown as Request
    const { res, render } = makeRes()
    res.locals.t = i18next.getFixedT('en-gb')
    const handler = paymentAmountPostHandler()
    await handler(req, res as unknown as Response, next)

    expect(render).toHaveBeenCalledWith(
      'pages/payment-amount',
      expect.objectContaining({ formValues: { amount: 'abc' } }),
    )
  })
})

describe('paymentAmountPostHandler success handling', () => {
  it('stores the amount in the session and redirects to the check details page', async () => {
    const req = { body: { amount: '10.00' }, session: {} } as unknown as Request
    const { res, redirect } = makeRes()
    res.locals.t = i18next.getFixedT('en-gb')
    const handler = paymentAmountPostHandler()
    await handler(req, res as unknown as Response, next)

    expect(req.session.sendMoney?.amount).toBe('10.00')
    expect(redirect).toHaveBeenCalledWith(res.locals.localePath('/debit-card/check'))
  })
})
