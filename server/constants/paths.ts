export const paths = {
  // top-level pages, not under a locale
  ROOT: '/',
  START: '/start-page',
  STAY_IN_TOUCH: '/info-page',

  // locale prefixes the locale router is mounted at, see server/routes/index.ts
  LOCALE_EN_GB: '/en-gb/',
  LOCALE_CY: '/cy/',

  // pages relative to the locale root, e.g. /en-gb/payment-choice
  BEFORE_YOU_CONTINUE: '/',
  PAYMENT_CHOICE: '/payment-choice',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  COOKIES: '/cookies',
  ACCESSIBILITY: '/accessibility',
  CONTACT_US: '/contact-us',
  HELP: '/help/',
}

// debit card pages, see server/routes/debit-card.ts
export const debitCardPaths = {
  PRISONER_DETAILS: '/debit-card/details',
  PAYMENT_AMOUNT: '/debit-card/amount',
  CHECK_DETAILS: '/debit-card/check',
}
