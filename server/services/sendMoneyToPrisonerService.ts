import logger from '../../logger'
import PrisonerMoniesApiClient from '../data/prisonerMoniesApiClient'

export interface PaymentServiceAvailability {
  available: boolean
  messageToUsers?: string
}

export default class SendMoneyToPrisonerService {
  constructor(private readonly prisonerMoniesApiClient: PrisonerMoniesApiClient) {}

  async getValidPrisoner(prisonerNumber: string, prisonerDOB: string) {
    return { prisonerNumber, prisonerDOB }
  }

  // service is deemed unavailable only if status is explicitly false, not if it cannot be determined
  async checkPaymentServiceAvailable(): Promise<PaymentServiceAvailability> {
    try {
      const response = await this.prisonerMoniesApiClient.getServiceAvailability()
      const govUkPayStatus = response?.gov_uk_pay ?? {}
      return {
        available: govUkPayStatus.status ?? true,
        messageToUsers: govUkPayStatus.message_to_users,
      }
    } catch (error) {
      logger.error(error, 'Could not check payment service availability')
      return { available: true }
    }
  }
}
