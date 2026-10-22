import SendMoneyToPrisonerService from './sendMoneyToPrisonerService'

describe('SendMoneyToPrisonerService', () => {
  describe('isPrisonerKnown', () => {
    it('returns true when prisoner is found', async () => {
      const result = await new SendMoneyToPrisonerService().isPrisonerKnown('A0076EA', '01-01-1999')
      expect(result).toBe(true)
    })

    it('returns false for a well-formed but unrecognised prisoner number', async () => {
      const result = await new SendMoneyToPrisonerService().isPrisonerKnown('A1409AX', '21-01-1989')
      expect(result).toBe(false)
    })

    it('returns false when the number matches but the date of birth does not', async () => {
      const result = await new SendMoneyToPrisonerService().isPrisonerKnown('A0076EA', '02-02-2000')
      expect(result).toBe(false)
    })
  })
})
