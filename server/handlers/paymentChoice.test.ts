import type { Request, Response } from 'express'
import paymentChoiceGetHandler from './paymentChoice'
import SendMoneyToPrisonerService from '../services/sendMoneyToPrisonerService'
import { paths, debitCardPaths } from '../constants/paths'
import makeRes from '../testutils/mockResponse'

jest.mock('../services/sendMoneyToPrisonerService')

describe('paymentChoiceGetHandler', () => {
  let sendMoneyToPrisonerService: jest.Mocked<SendMoneyToPrisonerService>

  beforeEach(() => {
    sendMoneyToPrisonerService = new SendMoneyToPrisonerService() as jest.Mocked<SendMoneyToPrisonerService>
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders the payment choice page as available when the service is up', async () => {
    sendMoneyToPrisonerService.checkPaymentServiceAvailable.mockResolvedValue({ available: true })
    const req = {} as unknown as Request
    const { res, render } = makeRes()

    await paymentChoiceGetHandler(sendMoneyToPrisonerService)(req, res as unknown as Response, jest.fn())

    expect(render).toHaveBeenCalledWith('pages/payment-choice', {
      backLinkHref: res.locals.localePath(paths.BEFORE_YOU_CONTINUE),
      continueUrl: res.locals.localePath(debitCardPaths.PRISONER_DETAILS),
      serviceAvailable: true,
      serviceUnavailableMessage: undefined,
    })
  })

  it('renders the payment choice page as unavailable with the message from the service when it is down', async () => {
    sendMoneyToPrisonerService.checkPaymentServiceAvailable.mockResolvedValue({
      available: false,
      messageToUsers: 'Down for maintenance',
    })
    const req = {} as unknown as Request
    const { res, render } = makeRes()

    await paymentChoiceGetHandler(sendMoneyToPrisonerService)(req, res as unknown as Response, jest.fn())

    expect(render).toHaveBeenCalledWith('pages/payment-choice', {
      backLinkHref: res.locals.localePath(paths.BEFORE_YOU_CONTINUE),
      continueUrl: res.locals.localePath(debitCardPaths.PRISONER_DETAILS),
      serviceAvailable: false,
      serviceUnavailableMessage: 'Down for maintenance',
    })
  })
})
