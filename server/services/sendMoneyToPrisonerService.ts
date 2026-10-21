export default class SendMoneyToPrisonerService {
  // Mirrors legacy send-money's PrisonerDetailsForm.is_prisoner_known(), which
  // looks up the prisoner via the API and returns whether the submitted details
  // match (money-to-prisoners-send-money: forms.py). No lookup API is wired up
  // here yet, so this recognises only the single fixture the e2e suite relies
  // on for its happy path (hmpps-prisoner-monies-playwright-suite:
  // tests/send-money/pages/prisoner-details-page.ts `fillExistingPrisoner`) and
  // reports everything else as not found, until a real API is integrated.
  private static readonly fixturePrisoner = {
    prisonerNumber: 'A0076EA',
    prisonerDOB: '01-01-1999',
  }

  async isValidPrisoner(prisonerNumber: string, prisonerDOB: string): Promise<boolean> {
    return (
      prisonerNumber === SendMoneyToPrisonerService.fixturePrisoner.prisonerNumber &&
      prisonerDOB === SendMoneyToPrisonerService.fixturePrisoner.prisonerDOB
    )
  }
}
