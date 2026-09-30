import type { NextFunction, Request, Response } from 'express'
import startPageHandler from './startPage'
import type { startPageHandlerConfig } from './startPage'

type ResSubset = Pick<Response, 'redirect' | 'render'>

const makeRes = (): { res: ResSubset; redirect: jest.Mock; render: jest.Mock } => {
  const redirect = jest.fn()
  const render = jest.fn()
  const res = { redirect, render } as unknown as ResSubset
  return { res, redirect, render }
}

const URL_SEND_MONEY = 'http://localhost:3000'
const URL_PRODUCTION_START_PAGE = 'https://www.gov.uk/send-prisoner-money'

describe('startPageHandler', () => {
  const req = {} as unknown as Request
  const next = jest.fn() as unknown as NextFunction

  it('redirects to external URL in production', () => {
    const config: startPageHandlerConfig = {
      production: true,
      productionStartPageUrl: URL_PRODUCTION_START_PAGE,
      sendMoneyUrl: URL_SEND_MONEY,
    }

    const handler = startPageHandler(config)
    const { res, redirect, render } = makeRes()

    handler(req, res as unknown as Response, next)

    expect(redirect).toHaveBeenCalledWith('https://www.gov.uk/send-prisoner-money')
    expect(render).not.toHaveBeenCalled()
  })

  it('displays example start page when not in production', () => {
    const config: startPageHandlerConfig = {
      production: false,
      productionStartPageUrl: URL_PRODUCTION_START_PAGE,
      sendMoneyUrl: URL_SEND_MONEY,
    }

    const handler = startPageHandler(config)
    const { res, redirect, render } = makeRes()

    handler(req, res as unknown as Response, next)

    expect(render).toHaveBeenCalledWith('pages/start-page', { sendMoneyUrl: URL_SEND_MONEY })
    expect(redirect).not.toHaveBeenCalled()
  })
})
