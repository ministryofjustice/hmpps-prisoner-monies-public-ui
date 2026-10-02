import { expect, type Locator, type Page } from '@playwright/test'
import AbstractPage from './abstractPage'

export default class BeforeYouContinuePage extends AbstractPage {
  readonly header: Locator

  readonly termsLink: Locator

  readonly privacyLink: Locator

  private constructor(page: Page) {
    super(page)
    this.header = page.getByRole('heading', { level: 1, name: 'Before you continue' })
    this.termsLink = page.getByRole('link', { name: 'terms and conditions' })
    this.privacyLink = page.getByRole('link', { name: 'privacy policy' })
  }

  static async verifyOnPage(page: Page): Promise<BeforeYouContinuePage> {
    const beforeYouContinuePage = new BeforeYouContinuePage(page)
    await expect(beforeYouContinuePage.header).toBeVisible()
    return beforeYouContinuePage
  }
}
