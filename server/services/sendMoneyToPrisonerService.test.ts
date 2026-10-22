import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import SendMoneyToPrisonerService from './sendMoneyToPrisonerService'
import PrisonerMoniesApiClient from '../data/prisonerMoniesApiClient'

jest.mock('../data/prisonerMoniesApiClient')

describe('SendMoneyToPrisonerService', () => {
  let prisonerMoniesApiClient: jest.Mocked<PrisonerMoniesApiClient>
  let sendMoneyToPrisonerService: SendMoneyToPrisonerService

  beforeEach(() => {
    prisonerMoniesApiClient = new PrisonerMoniesApiClient(
      {} as AuthenticationClient,
    ) as jest.Mocked<PrisonerMoniesApiClient>
    sendMoneyToPrisonerService = new SendMoneyToPrisonerService(prisonerMoniesApiClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

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
    it('returns available when gov_uk_pay status is true', async () => {
      prisonerMoniesApiClient.getServiceAvailability.mockResolvedValue({
        gov_uk_pay: { status: true },
      })

      const result = await sendMoneyToPrisonerService.checkPaymentServiceAvailable()

      expect(result).toEqual({ available: true, messageToUsers: undefined })
    })

    it('returns unavailable with the message from the API when gov_uk_pay status is false', async () => {
      prisonerMoniesApiClient.getServiceAvailability.mockResolvedValue({
        gov_uk_pay: { status: false, message_to_users: 'Down for maintenance' },
      })

      const result = await sendMoneyToPrisonerService.checkPaymentServiceAvailable()

      expect(result).toEqual({ available: false, messageToUsers: 'Down for maintenance' })
    })

    it('defaults to available when gov_uk_pay status is not present', async () => {
      prisonerMoniesApiClient.getServiceAvailability.mockResolvedValue({})

      const result = await sendMoneyToPrisonerService.checkPaymentServiceAvailable()

      expect(result).toEqual({ available: true, messageToUsers: undefined })
    })

    it('defaults to available when the API call fails (e.g. timeout)', async () => {
      prisonerMoniesApiClient.getServiceAvailability.mockRejectedValue(new Error('timeout'))

      const result = await sendMoneyToPrisonerService.checkPaymentServiceAvailable()

      expect(result).toEqual({ available: true })
    })
  })
})
