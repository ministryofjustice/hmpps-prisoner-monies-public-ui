import { expect, type Locator, type Page } from '@playwright/test'
import BasePage from '../utils/basePage'

export default class PaymentAmountPage extends BasePage {
  readonly header: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { level: 1, name: 'Enter amount to send' })
  }

  static async verifyOnPage(page: Page): Promise<PaymentAmountPage> {
    const paymentAmountPage = new PaymentAmountPage(page)
    await expect(paymentAmountPage.header).toBeVisible()
    return paymentAmountPage
  }
}
