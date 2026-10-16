import { type Page } from '@playwright/test'
import BasePage from '../utils/basePage'
import paths from '../../server/constants/paths'

export default class CheckDetailsPage extends BasePage {
  h1Title = 'Check details'

  protected path = paths.DEBIT_CARD.CHECK

  private constructor(page: Page) {
    super(page)
  }

  static async verifyOnPage(page: Page): Promise<CheckDetailsPage> {
    const checkDetailsPage = new CheckDetailsPage(page)
    await checkDetailsPage.expectH1Value()
    return checkDetailsPage
  }
}
