import { type Locator, type Page, expect } from '@playwright/test'

/*
    BasePage is a base class for all page objects. It contains common methods and properties that can be used
    by all page objects. Each page object should extend this class and override the properties and methods as
    needed.

    Properties:
    - url: The URL of the page. This should be overridden by each page object to provide the correct URL for that page.
    - continueButtonId: The locator of the continue button on the page. This should be overridden by each page
      object to provide the correct locator for that page.
    - h1Title: The expected text of the h1 element on the page. This should be overridden by each page object to
      provide the correct text for that page.
*/
export default class BasePage {
  readonly page: Page

  /** phase banner that appears in the header, common to every page */
  readonly phaseBanner: Locator

  continueButtonId: string = '#id_next_btn'

  h1Title: string = ''

  protected url: string = '<missing-url>'

  protected constructor(page: Page) {
    this.page = page
    this.phaseBanner = page.getByTestId('header-phase-banner')
  }

  async goto() {
    await this.page.goto(this.url)
  }

  async expectH1Value(h1Value?: string) {
    await expect(this.page.locator('h1')).toContainText(h1Value ?? this.h1Title)
  }

  async continueButtonClick(continueButton?: Locator) {
    const button = continueButton ?? this.page.locator(this.continueButtonId)
    await expect(button).toBeVisible()
    await expect(button).toBeEnabled()
    await button.click()
  }
}
