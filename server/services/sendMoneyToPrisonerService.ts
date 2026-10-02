export default class SendMoneyToPrisonerService {
  async getValidPrisoner(prisonerNumber: string, prisonerDOB: string) {
    return { prisonerNumber, prisonerDOB }
  }
}
