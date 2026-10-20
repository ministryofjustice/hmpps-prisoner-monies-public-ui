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

  /** main content area, scoped to exclude the common header/footer */
  readonly mainContent: Locator

  /** footer, common to every page */
  readonly footer: Locator

  // defaults to en-gb on init()
  protected locale: string

  continueButtonId: string = '#id_next_btn'

  h1Title: string = ''

  protected path: string = '<missing-path>'

  protected constructor(page: Page, locale: string = 'en-gb') {
    this.page = page
    this.phaseBanner = page.getByTestId('header-phase-banner')
    this.mainContent = page.locator('#main-content')
    this.footer = page.locator('footer.govuk-template__footer')
    this.locale = locale
  }

  protected get url(): string {
    /*
      Build a valid path based on the locale + set path for the page.
    */
    return `/${this.locale}${this.path.startsWith('/') ? this.path : `/${this.path}`}`
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
