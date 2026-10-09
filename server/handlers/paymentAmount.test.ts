import type { NextFunction, Request, Response } from 'express'
import { paymentAmountGetHandler, paymentAmountPostHandler } from './paymentAmount'

type ResSubset = Pick<Response, 'redirect' | 'render'>

const makeRes = (): { res: ResSubset; redirect: jest.Mock; render: jest.Mock } => {
  const redirect = jest.fn()
  const render = jest.fn()
  const res = { redirect, render } as unknown as ResSubset
  return { res, redirect, render }
}

const next = jest.fn() as unknown as NextFunction

describe('paymentAmountGetHandler', () => {
  it('renders the payment amount page with empty form values and errors', () => {
    const req = {} as unknown as Request
    const { res, render } = makeRes()

    paymentAmountGetHandler(req, res as unknown as Response, next)

    expect(render).toHaveBeenCalledWith('pages/payment-amount', {
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
    const handler = paymentAmountPostHandler()
    await handler(req, res as unknown as Response, next)

    expect(render).toHaveBeenCalledWith(
      'pages/payment-amount',
      expect.objectContaining({ formValues: { amount: 'abc' } }),
    )
  })
})
