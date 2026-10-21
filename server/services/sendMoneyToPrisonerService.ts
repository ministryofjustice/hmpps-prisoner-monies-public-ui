const validTestPrisoner = {
  prisonerNumber: 'A0076EA',
  prisonerDOB: '01-01-1999',
} as const

export default class SendMoneyToPrisonerService {
  async isPrisonerKnown(prisonerNumber: string, prisonerDOB: string): Promise<boolean> {
    return prisonerNumber === validTestPrisoner.prisonerNumber && prisonerDOB === validTestPrisoner.prisonerDOB
  }
}
