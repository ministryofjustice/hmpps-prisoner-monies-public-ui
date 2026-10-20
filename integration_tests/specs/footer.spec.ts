import { expect, test } from '@playwright/test'
import { paths, debitCardPaths } from '../../server/constants/paths'

type Locale = 'en-gb' | 'cy'

const locales: Locale[] = ['en-gb', 'cy']

// pages the footer is expected to render identically on, beyond the homepage
const pagesToCheck: Record<string, string> = {
  'before you continue page': paths.BEFORE_YOU_CONTINUE,
  'prisoner details page': debitCardPaths.PRISONER_DETAILS,
}

const footerLinks: { linkText: Record<Locale, string>; path: string; heading: Record<Locale, string> }[] = [
  {
    linkText: { 'en-gb': 'Terms and conditions', cy: 'Telerau ac amodau' },
    path: paths.TERMS,
    heading: { 'en-gb': 'Terms and conditions', cy: 'Terms and conditions' },
  },
  {
    linkText: { 'en-gb': 'Privacy policy', cy: 'Polisi preifatrwydd' },
    path: paths.PRIVACY,
    heading: { 'en-gb': 'Privacy policy', cy: 'Privacy policy' },
  },
  {
    linkText: { 'en-gb': 'Cookies', cy: 'Cwcis' },
    path: paths.COOKIES,
    heading: { 'en-gb': 'Cookies', cy: 'Cwcis' },
  },
  {
    // no verified Welsh translation exists for this string yet (see Link Text & Translations in the migration skill), so it stays in English for both locales
    linkText: { 'en-gb': 'Accessibility statement', cy: 'Accessibility statement' },
    path: paths.ACCESSIBILITY,
    heading: { 'en-gb': 'Accessibility statement', cy: 'Accessibility statement' },
  },
  {
    linkText: { 'en-gb': 'Help', cy: 'Cymorth' },
    path: paths.HELP,
    heading: { 'en-gb': 'Help', cy: 'Cymorth' },
  },
]

test.describe('Footer', () => {
  for (const locale of locales) {
    test.describe(`locale: ${locale}`, () => {
      for (const [pageName, path] of Object.entries(pagesToCheck)) {
        test(`renders on the ${pageName}`, async ({ page }) => {
          await page.goto(`/${locale}${path}`)

          const footer = page.locator('footer.govuk-template__footer')
          await expect(footer).toBeVisible()
          await expect(footer.getByText('Support links', { exact: true })).toBeAttached()
          await Promise.all(
            footerLinks.map(({ linkText }) =>
              expect(footer.getByRole('link', { name: linkText[locale], exact: true })).toBeVisible(),
            ),
          )
          await expect(footer.getByText('Open Government Licence v3.0')).toBeVisible()
          await expect(footer.getByText('© Crown copyright')).toBeVisible()
        })
      }

      for (const { linkText, path, heading } of footerLinks) {
        test(`"${linkText['en-gb']}" link navigates to its page`, async ({ page }) => {
          await page.goto(`/${locale}${paths.BEFORE_YOU_CONTINUE}`)

          const footer = page.locator('footer.govuk-template__footer')
          await footer.getByRole('link', { name: linkText[locale], exact: true }).click()

          await expect(page).toHaveURL(new RegExp(`${path}$`))
          await expect(page.getByRole('heading', { level: 1, name: heading[locale] })).toBeVisible()
        })
      }

      test('"Built by" links to the MOJ Digital blog', async ({ page }) => {
        await page.goto(`/${locale}${paths.BEFORE_YOU_CONTINUE}`)

        const footer = page.locator('footer.govuk-template__footer')
        const builtByLink = footer.getByRole('link', { name: 'MOJ Digital' })
        await expect(builtByLink).toHaveAttribute('href', 'https://mojdigital.blog.gov.uk/')
      })
    })
  }
})
