import { expect, type Locator, type Page } from '@playwright/test'
import BasePage from '../utils/basePage'

export type PaymentAmountFormInput = {
  amount?: string
}

export default class PaymentAmountPage extends BasePage {
  readonly header: Locator

  readonly amountInput: Locator

  readonly errorSummary: Locator

  protected url = '/debit-card/amount'

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { level: 1, name: 'Enter amount to send' })
    this.amountInput = page.locator('#id_amount')
    this.errorSummary = page.locator('.govuk-error-summary')
  }

  static async goTo(page: Page): Promise<PaymentAmountPage> {
    const paymentAmountPage = new PaymentAmountPage(page)
    await paymentAmountPage.goto()
    await expect(paymentAmountPage.header).toBeVisible()
    return paymentAmountPage
  }

  static async verifyOnPage(page: Page): Promise<PaymentAmountPage> {
    const paymentAmountPage = new PaymentAmountPage(page)
    await expect(paymentAmountPage.header).toBeVisible()
    return paymentAmountPage
  }

  async fillForm({ amount }: PaymentAmountFormInput) {
    if (amount !== undefined) await this.amountInput.fill(amount)
  }

  async checkDetails() {
    await this.continueButtonClick()
  }

  errorMessageLink(label: string): Locator {
    return this.errorSummary.getByRole('link', { name: label })
  }
}
