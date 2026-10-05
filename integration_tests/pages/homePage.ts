import { type Locator, type Page } from '@playwright/test'
import BasePage from './basePage'

export default class HomePage extends BasePage {
  readonly startNowButton: Locator

  h1Title = 'Send money to someone in prison'

  protected url = '/'

  private constructor(page: Page) {
    super(page)
    this.startNowButton = page.getByRole('button', { name: 'Start now' })
  }

  static async verifyOnPage(page: Page): Promise<HomePage> {
    const homePage = new HomePage(page)
    await homePage.expectH1Value()
    return homePage
  }

  async clickStartNow() {
    await this.continueButtonClick(this.startNowButton)
  }
}
