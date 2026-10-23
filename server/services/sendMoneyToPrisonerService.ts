export interface PaymentServiceAvailability {
  available: boolean
  messageToUsers?: string
}

export default class SendMoneyToPrisonerService {
  async getValidPrisoner(prisonerNumber: string, prisonerDOB: string) {
    return { prisonerNumber, prisonerDOB }
  }

  // TODO: implement via <ticket>
  async checkPaymentServiceAvailable(): Promise<PaymentServiceAvailability> {
    return { available: true }
  }
}
