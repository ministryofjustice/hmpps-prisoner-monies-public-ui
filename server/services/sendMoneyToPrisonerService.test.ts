import SendMoneyToPrisonerService from './sendMoneyToPrisonerService'

describe('SendMoneyToPrisonerService', () => {
  const sendMoneyToPrisonerService = new SendMoneyToPrisonerService()

  describe('getValidPrisoner', () => {
    it('returns the matching prisoner', async () => {
      const prisonerNumber = 'A1234BC'
      const prisonerDOB = '1-1-1999'
      const result = await sendMoneyToPrisonerService.getValidPrisoner(prisonerNumber, prisonerDOB)
      expect(result).toEqual({
        prisonerNumber,
        prisonerDOB,
      })
    })
  })

  describe('checkPaymentServiceAvailable', () => {
    it('returns available (stubbed until the backend check is implemented)', async () => {
      const result = await sendMoneyToPrisonerService.checkPaymentServiceAvailable()

      expect(result).toEqual({ available: true })
    })
  })
})
