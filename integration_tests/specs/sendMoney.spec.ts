import { expect, test } from '@playwright/test'
import HomePage from '../pages/homePage'
import BeforeYouContinuePage from '../pages/beforeYouContinuePage'
import PrisonerDetailsPage, { type PrisonerDetailsFormInput } from '../pages/prisonerDetailsPage'
import PaymentAmountPage from '../pages/paymentAmountPage'
import CheckDetailsPage from '../pages/checkDetailsPage'
import { paths, debitCardPaths } from '../../server/constants/paths'

const VALID_PRISONER_DETAILS: PrisonerDetailsFormInput = {
  prisonerName: 'bill baxter',
  prisonerDobDay: '01',
  prisonerDobMonth: '01',
  prisonerDobYear: '1999',
  prisonerNumber: 'A0076EA',
}

test.describe('Send money journey', () => {
  test('Start page links through to the before you continue page', async ({ page }) => {
    const homePage = await HomePage.goTo(page)

    await homePage.clickStartNow()

    await expect(page).toHaveURL(new RegExp(`${paths.LOCALE_EN_GB}$`))
    await BeforeYouContinuePage.verifyOnPage(page)
  })

  test('Before you continue page links to terms and privacy policy', async ({ page }) => {
    const beforeYouContinuePage = await BeforeYouContinuePage.goTo(page)

    await beforeYouContinuePage.termsLink.click()
    await expect(page).toHaveURL(new RegExp(`${paths.TERMS}$`))
    await expect(page.getByRole('heading', { level: 1, name: 'Terms and conditions' })).toBeVisible()

    await page.goBack()
    await beforeYouContinuePage.privacyLink.click()
    await expect(page).toHaveURL(new RegExp(`${paths.PRIVACY}$`))
    await expect(page.getByRole('heading', { level: 1, name: 'Privacy policy' })).toBeVisible()
  })

  test('Before you continue page back link returns to the start page', async ({ page }) => {
    const beforeYouContinuePage = await BeforeYouContinuePage.goTo(page)

    await expect(beforeYouContinuePage.backLink).toBeVisible()
    await beforeYouContinuePage.backLink.click()

    await expect(page).toHaveURL(paths.START.slice(1))
    await HomePage.verifyOnPage(page)
  })

  test.skip('Before you continue page continue button moves the user on to the next page', async ({ page }) => {
    // Skipped: /payment-choice is currently an unimplemented 404 stub route (see server/routes/index.ts).
    // Un-skip once the payment-choice page is implemented and chains through to prisoner details.
    const beforeYouContinuePage = await BeforeYouContinuePage.goTo(page)

    await beforeYouContinuePage.clickContinue()

    await expect(page).toHaveURL(new RegExp(`${debitCardPaths.PRISONER_DETAILS}$`))
    await PrisonerDetailsPage.verifyOnPage(page)
  })

  test('Enter prisoner details page is reachable and has a back link', async ({ page }) => {
    const prisonerDetailsPage = await PrisonerDetailsPage.goTo(page)

    await expect(prisonerDetailsPage.backLink).toBeVisible()
  })

  test('Submitting an empty form shows the error summary (with field links) and an inline error message for every field', async ({
    page,
  }) => {
    const prisonerDetailsPage = await PrisonerDetailsPage.goTo(page)

    await prisonerDetailsPage.submit()

    await test.step('stays on the prisoner details page', async () => {
      await expect(page).toHaveURL(new RegExp(`${debitCardPaths.PRISONER_DETAILS}$`))
    })

    await test.step('shows the error summary with a link for every field', async () => {
      await expect(prisonerDetailsPage.errorSummary).toBeVisible()
      await expect(prisonerDetailsPage.errorMessageLink('Prisoner name')).toBeVisible()
      await expect(prisonerDetailsPage.errorMessageLink('Prisoner date of birth')).toBeVisible()
      await expect(prisonerDetailsPage.errorMessageLink('Prisoner number')).toBeVisible()
    })

    await test.step('shows an inline error message for every field', async () => {
      await prisonerDetailsPage.verifyErrorMessagesVisible()
    })
  })

  test('Submitting valid prisoner details moves the user on to the amount page', async ({ page }) => {
    const prisonerDetailsPage = await PrisonerDetailsPage.goTo(page)

    await prisonerDetailsPage.fillForm(VALID_PRISONER_DETAILS)
    await prisonerDetailsPage.submit()

    await expect(page).toHaveURL(new RegExp(`${debitCardPaths.PAYMENT_AMOUNT}$`))
    await PaymentAmountPage.verifyOnPage(page)
  })

  test('Submitting a valid amount moves the user on to the check details page', async ({ page }) => {
    const amountPage = await PaymentAmountPage.goTo(page)
    await amountPage.fillForm({ amount: '10.00' })

    await amountPage.checkDetails()
    await expect(page).toHaveURL(new RegExp(`${debitCardPaths.CHECK_DETAILS}$`))
    await CheckDetailsPage.verifyOnPage(page)
  })

  test('Submitting an empty amount shows a validation error', async ({ page }) => {
    const amountPage = await PaymentAmountPage.goTo(page)

    await amountPage.checkDetails()

    await expect(page).toHaveURL(new RegExp(`${debitCardPaths.PAYMENT_AMOUNT}$`))
    await expect(amountPage.errorSummary).toBeVisible()
    await expect(amountPage.errorMessageLink('Amount')).toBeVisible()
  })
})
