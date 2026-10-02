import { expect, test } from '@playwright/test'
import HomePage from '../pages/homePage'
import BeforeYouContinuePage from '../pages/beforeYouContinuePage'
import PrisonerDetailsPage from '../pages/prisonerDetailsPage'
import PaymentAmountPage from '../pages/paymentAmountPage'

test.describe('Send money journey', () => {
  test('Start page links through to the before you continue page', async ({ page }) => {
    await page.goto('/')
    const homePage = await HomePage.verifyOnPage(page)

    await homePage.clickStartNow()

    await expect(page).toHaveURL(/\/en-gb\/$/)
    await BeforeYouContinuePage.verifyOnPage(page)
  })

  test('Before you continue page links to terms and privacy policy', async ({ page }) => {
    await page.goto('/en-gb/')
    const beforeYouContinuePage = await BeforeYouContinuePage.verifyOnPage(page)

    await beforeYouContinuePage.termsLink.click()
    await expect(page).toHaveURL(/\/terms$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Terms and conditions' })).toBeVisible()

    await page.goBack()
    await beforeYouContinuePage.privacyLink.click()
    await expect(page).toHaveURL(/\/privacy$/)
    await expect(page.getByRole('heading', { level: 1, name: 'Privacy policy' })).toBeVisible()
  })

  test('Enter prisoner details page is reachable and has a back link', async ({ page }) => {
    const prisonerDetailsPage = await PrisonerDetailsPage.goTo(page)

    await expect(prisonerDetailsPage.header).toBeVisible()
    await expect(prisonerDetailsPage.backLink).toBeVisible()
  })

  test('Submitting an empty form shows validation errors for every field', async ({ page }) => {
    const prisonerDetailsPage = await PrisonerDetailsPage.goTo(page)

    await prisonerDetailsPage.submit()

    await expect(prisonerDetailsPage.errorSummary).toBeVisible()
    await expect(prisonerDetailsPage.errorMessageLink('Prisoner name')).toBeVisible()
    await expect(prisonerDetailsPage.errorMessageLink('Prisoner date of birth')).toBeVisible()
    await expect(prisonerDetailsPage.errorMessageLink('Prisoner number')).toBeVisible()
  })

  test('Submitting valid prisoner details moves the user on to the amount page', async ({ page }) => {
    const prisonerDetailsPage = await PrisonerDetailsPage.goTo(page)

    await prisonerDetailsPage.fillForm({
      prisonerName: 'John Smith',
      prisonerDobDay: '1',
      prisonerDobMonth: '2',
      prisonerDobYear: '1990',
      prisonerNumber: 'A1234BC',
    })
    await prisonerDetailsPage.submit()

    await expect(page).toHaveURL(/\/debit-card\/amount$/)
    await PaymentAmountPage.verifyOnPage(page)
  })
})
