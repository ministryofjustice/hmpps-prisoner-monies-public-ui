import { type Page } from '@playwright/test'
import BasePage from '../utils/basePage'

export default class CheckDetailsPage extends BasePage {
  h1Title = 'Check details'

  protected path = '/debit-card/check'

  private constructor(page: Page) {
    super(page)
  }

  static async verifyOnPage(page: Page): Promise<CheckDetailsPage> {
    const checkDetailsPage = new CheckDetailsPage(page)
    await checkDetailsPage.expectH1Value()
    return checkDetailsPage
  }
}
