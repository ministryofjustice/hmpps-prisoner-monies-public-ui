import { type Locator, type Page } from '@playwright/test'
import BasePage from './basePage'

export default class BeforeYouContinuePage extends BasePage {
  readonly termsLink: Locator

  readonly privacyLink: Locator

  h1Title = 'Before you continue'

  protected url = '/en-gb/'

  private constructor(page: Page) {
    super(page)
    this.termsLink = page.getByRole('link', { name: 'terms and conditions' })
    this.privacyLink = page.getByRole('link', { name: 'privacy policy' })
  }

  static async goTo(page: Page): Promise<BeforeYouContinuePage> {
    await page.goto('/en-gb/')
    return BeforeYouContinuePage.verifyOnPage(page)
  }

  static async verifyOnPage(page: Page): Promise<BeforeYouContinuePage> {
    const beforeYouContinuePage = new BeforeYouContinuePage(page)
    await beforeYouContinuePage.expectH1Value()
    return beforeYouContinuePage
  }

  async clickContinue() {
    await this.continueButtonClick()
  }
}
