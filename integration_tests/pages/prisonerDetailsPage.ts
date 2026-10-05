import { type Locator, type Page } from '@playwright/test'
import BasePage from '../utils/basePage'

export type PrisonerDetailsFormInput = {
  prisonerName?: string
  prisonerDobDay?: string
  prisonerDobMonth?: string
  prisonerDobYear?: string
  prisonerNumber?: string
}

export default class PrisonerDetailsPage extends BasePage {
  readonly backLink: Locator

  readonly errorSummary: Locator

  readonly prisonerNameInput: Locator

  readonly prisonerDobDayInput: Locator

  readonly prisonerDobMonthInput: Locator

  readonly prisonerDobYearInput: Locator

  readonly prisonerNumberInput: Locator

  h1Title = 'Enter prisoner details'

  protected url = '/debit-card/details'

  private constructor(page: Page) {
    super(page)
    this.backLink = page.getByRole('link', { name: 'Back' })
    this.errorSummary = page.locator('.govuk-error-summary')
    this.prisonerNameInput = page.locator('#id_prisoner_name')
    this.prisonerDobDayInput = page.locator('#id_prisoner_dob_0')
    this.prisonerDobMonthInput = page.locator('#id_prisoner_dob_1')
    this.prisonerDobYearInput = page.locator('#id_prisoner_dob_2')
    this.prisonerNumberInput = page.locator('#id_prisoner_number')
  }

  static async goTo(page: Page): Promise<PrisonerDetailsPage> {
    const prisonerDetailsPage = new PrisonerDetailsPage(page)
    await prisonerDetailsPage.goto()
    await prisonerDetailsPage.expectH1Value()
    return prisonerDetailsPage
  }

  static async verifyOnPage(page: Page): Promise<PrisonerDetailsPage> {
    const prisonerDetailsPage = new PrisonerDetailsPage(page)
    await prisonerDetailsPage.expectH1Value()
    return prisonerDetailsPage
  }

  async fillForm({
    prisonerName,
    prisonerDobDay,
    prisonerDobMonth,
    prisonerDobYear,
    prisonerNumber,
  }: PrisonerDetailsFormInput) {
    if (prisonerName !== undefined) await this.prisonerNameInput.fill(prisonerName)
    if (prisonerDobDay !== undefined) await this.prisonerDobDayInput.fill(prisonerDobDay)
    if (prisonerDobMonth !== undefined) await this.prisonerDobMonthInput.fill(prisonerDobMonth)
    if (prisonerDobYear !== undefined) await this.prisonerDobYearInput.fill(prisonerDobYear)
    if (prisonerNumber !== undefined) await this.prisonerNumberInput.fill(prisonerNumber)
  }

  async submit() {
    await this.continueButtonClick()
  }

  errorMessageLink(label: string): Locator {
    return this.errorSummary.getByRole('link', { name: label })
  }
}
