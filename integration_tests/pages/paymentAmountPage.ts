import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class PaymentAmountPage extends AbstractPage {
  readonly header: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { level: 1, name: 'Amount' })
  }

  static async verifyOnPage(page: Page): Promise<PaymentAmountPage> {
    const paymentAmountPage = new PaymentAmountPage(page)
    await expect(paymentAmountPage.header).toBeVisible()
    return paymentAmountPage
  }
}
