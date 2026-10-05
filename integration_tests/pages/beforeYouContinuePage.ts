import { type Locator, type Page } from '@playwright/test'
import BasePage from '../utils/basePage'

export default class BeforeYouContinuePage extends BasePage {
  readonly termsLink: Locator

  readonly privacyLink: Locator

  readonly backLink: Locator

  h1Title = 'Before you continue'

  protected url = '/en-gb/'

  private constructor(page: Page) {
    super(page)
    this.termsLink = page.getByRole('link', { name: 'terms and conditions' })
    this.privacyLink = page.getByRole('link', { name: 'privacy policy' })
    this.backLink = page.getByRole('link', { name: 'Back' })
  }

  static async goTo(page: Page): Promise<BeforeYouContinuePage> {
    const beforeYouContinuePage = new BeforeYouContinuePage(page)
    await beforeYouContinuePage.goto()
    await beforeYouContinuePage.expectH1Value()
    return beforeYouContinuePage
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
