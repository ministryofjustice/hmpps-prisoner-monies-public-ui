import { type Locator, type Page } from '@playwright/test'
import BasePage from '../utils/basePage'
import path from '../../server/constants/paths'

export default class HomePage extends BasePage {
  readonly startNowButton: Locator

  h1Title = 'Send money to someone in prison'

  protected path = path.START

  private constructor(page: Page) {
    // no locale specified, default to empty string
    super(page, '')
    this.startNowButton = page.getByRole('button', { name: 'Start now' })
  }

  protected get url(): string {
    return this.path
  }

  static async goTo(page: Page): Promise<HomePage> {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.expectH1Value()
    return homePage
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
