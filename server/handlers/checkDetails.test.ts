import type { Request, Response } from 'express'
import checkDetailsGetHandler from './checkDetails'
import makeRes from '../testutils/mockResponse'

describe('checkDetailsGetHandler', () => {
  it('renders the check details page with the prisoner number and amount from the session', () => {
    const req = {
      session: { sendMoney: { prisonerNumber: 'A1234BC', amount: '10.00' } },
    } as unknown as Request
    const { res, render } = makeRes()

    checkDetailsGetHandler(req, res as unknown as Response, jest.fn())

    expect(render).toHaveBeenCalledWith('pages/check-details', {
      prisonerNumber: 'A1234BC',
      amount: '10.00',
    })
  })

  it('renders with undefined values when nothing has been stored in the session yet', () => {
    const req = { session: {} } as unknown as Request
    const { res, render } = makeRes()

    checkDetailsGetHandler(req, res as unknown as Response, jest.fn())

    expect(render).toHaveBeenCalledWith('pages/check-details', {
      prisonerNumber: undefined,
      amount: undefined,
    })
  })
})
