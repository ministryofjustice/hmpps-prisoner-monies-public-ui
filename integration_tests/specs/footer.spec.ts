import { expect, test } from '@playwright/test'
import { paths, debitCardPaths } from '../../server/constants/paths'

const FOOTER = 'footer.govuk-template__footer'

const locales = ['en-gb', 'cy'] as const

// journey pages that should share the footer
const pagesWithFooter = [debitCardPaths.PRISONER_DETAILS, debitCardPaths.PAYMENT_AMOUNT, debitCardPaths.CHECK_DETAILS]

// one row per locale/link combination, using the exact text actually rendered (no locale lookups needed)
const footerLinkCases = [
  { locale: 'en-gb', linkText: 'Terms and conditions', path: paths.TERMS, heading: 'Terms and conditions' },
  { locale: 'cy', linkText: 'Telerau ac amodau', path: paths.TERMS, heading: 'Telerau ac amodau' },
  { locale: 'en-gb', linkText: 'Privacy policy', path: paths.PRIVACY, heading: 'Privacy policy' },
  { locale: 'cy', linkText: 'Polisi preifatrwydd', path: paths.PRIVACY, heading: 'Polisi preifatrwydd' },
  { locale: 'en-gb', linkText: 'Cookies', path: paths.COOKIES, heading: 'Cookies' },
  { locale: 'cy', linkText: 'Cwcis', path: paths.COOKIES, heading: 'Cwcis' },
  // no verified Welsh translation exists for this string yet, so it stays in English for both locales
  {
    locale: 'en-gb',
    linkText: 'Accessibility statement',
    path: paths.ACCESSIBILITY,
    heading: 'Accessibility statement',
  },
  { locale: 'cy', linkText: 'Accessibility statement', path: paths.ACCESSIBILITY, heading: 'Accessibility statement' },
  { locale: 'en-gb', linkText: 'Help', path: paths.HELP, heading: 'Help' },
  { locale: 'cy', linkText: 'Cymorth', path: paths.HELP, heading: 'Cymorth' },
] as const

test.describe('Footer', () => {
  test('renders the support links and crown copyright/OGL licence', async ({ page }) => {
    await page.goto(paths.LOCALE_EN_GB)
    const footer = page.locator(FOOTER)

    await expect(footer).toBeVisible()
    await expect(footer.getByText('Support links', { exact: true })).toBeAttached()
    await expect(footer.getByText('Open Government Licence v3.0')).toBeVisible()
    await expect(footer.getByText('© Crown copyright')).toBeVisible()
  })

  for (const locale of locales) {
    for (const path of pagesWithFooter) {
      test(`[${locale}] footer is present on ${path}`, async ({ page }) => {
        await page.goto(`/${locale}${path}`)
        await expect(page.locator(FOOTER)).toBeVisible()
      })
    }
  }

  for (const { locale, linkText, path, heading } of footerLinkCases) {
    test(`[${locale}] "${linkText}" link navigates to its page`, async ({ page }) => {
      await page.goto(`/${locale}${paths.BEFORE_YOU_CONTINUE}`)

      await page.locator(FOOTER).getByRole('link', { name: linkText, exact: true }).click()

      await expect(page).toHaveURL(new RegExp(`${path}$`))
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    })
  }

  for (const locale of locales) {
    test(`[${locale}] "Built by" links to the MOJ Digital blog`, async ({ page }) => {
      await page.goto(`/${locale}${paths.BEFORE_YOU_CONTINUE}`)

      await expect(page.locator(FOOTER).getByRole('link', { name: 'MOJ Digital' })).toHaveAttribute(
        'href',
        'https://mojdigital.blog.gov.uk/',
      )
    })
  }
})
