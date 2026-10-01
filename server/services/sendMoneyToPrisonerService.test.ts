import SendMoneyToPrisonerService from './sendMoneyToPrisonerService'

describe('SendMoneyToPrisonerService', () => {
  describe('getValidPrisoner', () => {
    it('returns the matching prisoner', async () => {
      const prisonerNumber = 'A1234BC'
      const prisonerDOB = '01-01-1999'
      const sendMoneyService = await new SendMoneyToPrisonerService().getValidPrisoner(prisonerNumber, prisonerDOB)
      expect(sendMoneyService).toEqual({
        prisonerNumber,
        prisonerDOB,
      })
    })
  })
})
