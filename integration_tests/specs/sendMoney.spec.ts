import { expect, test } from '@playwright/test'
import HomePage from '../pages/homePage'
import BeforeYouContinuePage from '../pages/beforeYouContinuePage'
import PrisonerDetailsPage, { type PrisonerDetailsFormInput } from '../pages/prisonerDetailsPage'
import PaymentAmountPage from '../pages/paymentAmountPage'

const VALID_PRISONER_DETAILS: PrisonerDetailsFormInput = {
  prisonerName: 'John Smith',
  prisonerDobDay: '1',
  prisonerDobMonth: '2',
  prisonerDobYear: '1990',
  prisonerNumber: 'A1234BC',
}

test.describe('Send money journey', () => {
  test('Start page links through to the before you continue page', async ({ page }) => {
    const homePage = await HomePage.goTo(page)

    await homePage.clickStartNow()

    await expect(page).toHaveURL(/\/en-gb\/$/)
    await BeforeYouContinuePage.verifyOnPage(page)
  })

  test('Before you continue page links to terms and privacy policy', async ({ page }) => {
    const beforeYouContinuePage = await BeforeYouContinuePage.goTo(page)

    await beforeYouContinuePage.termsLink.click()
    await expect(page).toHaveURL(/\/terms$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Terms and conditions' })).toBeVisible()

    await page.goBack()
    await beforeYouContinuePage.privacyLink.click()
    await expect(page).toHaveURL(/\/privacy$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Privacy policy' })).toBeVisible()
  })

  test('Before you continue page back link returns to the start page', async ({ page }) => {
    const beforeYouContinuePage = await BeforeYouContinuePage.goTo(page)

    await expect(beforeYouContinuePage.backLink).toBeVisible()
    await beforeYouContinuePage.backLink.click()

    await expect(page).toHaveURL('start-page')
    await HomePage.verifyOnPage(page)
  })

  test.skip('Before you continue page continue button moves the user on to the next page', async ({ page }) => {
    // Skipped: /payment-choice is currently an unimplemented 404 stub route (see server/routes/index.ts).
    // Un-skip once the payment-choice page is implemented and chains through to prisoner details.
    const beforeYouContinuePage = await BeforeYouContinuePage.goTo(page)

    await beforeYouContinuePage.clickContinue()

    await expect(page).toHaveURL(/\/debit-card\/details$/)
    await PrisonerDetailsPage.verifyOnPage(page)
  })

  test('Enter prisoner details page is reachable and has a back link', async ({ page }) => {
    const prisonerDetailsPage = await PrisonerDetailsPage.goTo(page)

    await expect(prisonerDetailsPage.backLink).toBeVisible()
  })

  test('Submitting an empty form shows validation errors for every field', async ({ page }) => {
    const prisonerDetailsPage = await PrisonerDetailsPage.goTo(page)

    await prisonerDetailsPage.submit()

    await expect(page).toHaveURL(/\/debit-card\/details$/)
    await expect(prisonerDetailsPage.errorSummary).toBeVisible()
    await expect(prisonerDetailsPage.errorMessageLink('Prisoner name')).toBeVisible()
    await expect(prisonerDetailsPage.errorMessageLink('Prisoner date of birth')).toBeVisible()
    await expect(prisonerDetailsPage.errorMessageLink('Prisoner number')).toBeVisible()
  })

  test('Submitting valid prisoner details moves the user on to the amount page', async ({ page }) => {
    const prisonerDetailsPage = await PrisonerDetailsPage.goTo(page)

    await prisonerDetailsPage.fillForm(VALID_PRISONER_DETAILS)
    await prisonerDetailsPage.submit()

    await expect(page).toHaveURL(/\/debit-card\/amount$/)
    await PaymentAmountPage.verifyOnPage(page)
  })
})
