import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export type PrisonerDetailsFormInput = {
  prisonerName?: string
  prisonerDobDay?: string
  prisonerDobMonth?: string
  prisonerDobYear?: string
  prisonerNumber?: string
}

export default class PrisonerDetailsPage extends AbstractPage {
  readonly header: Locator

  readonly backLink: Locator

  readonly errorSummary: Locator

  readonly prisonerNameInput: Locator

  readonly prisonerDobDayInput: Locator

  readonly prisonerDobMonthInput: Locator

  readonly prisonerDobYearInput: Locator

  readonly prisonerNumberInput: Locator

  readonly submitButton: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { level: 1, name: 'Enter prisoner details' })
    this.backLink = page.getByRole('link', { name: 'Back' })
    this.errorSummary = page.locator('.govuk-error-summary')
    this.prisonerNameInput = page.locator('#id_prisoner_name')
    this.prisonerDobDayInput = page.locator('#id_prisoner_dob_0')
    this.prisonerDobMonthInput = page.locator('#id_prisoner_dob_1')
    this.prisonerDobYearInput = page.locator('#id_prisoner_dob_2')
    this.prisonerNumberInput = page.locator('#id_prisoner_number')
    this.submitButton = page.locator('#id_next_btn')
  }

  static async goTo(page: Page): Promise<PrisonerDetailsPage> {
    await page.goto('/debit-card/details')
    return PrisonerDetailsPage.verifyOnPage(page)
  }

  static async verifyOnPage(page: Page): Promise<PrisonerDetailsPage> {
    const prisonerDetailsPage = new PrisonerDetailsPage(page)
    await expect(prisonerDetailsPage.header).toBeVisible()
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
    await this.submitButton.click()
  }

  errorMessageLink(label: string): Locator {
    return this.errorSummary.getByRole('link', { name: label })
  }
}
