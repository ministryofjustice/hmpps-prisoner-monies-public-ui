const paths = {
  ROOT: '/',
  START: '/start-page',
  STAY_IN_TOUCH: '/info-page',

  // where the locale-specific router is mounted, see server/routes/index.ts
  LOCALE: {
    EN_GB: '/en-gb/',
    CY: '/cy/',
  },

  // locale-relative paths, mounted under both LOCALE.EN_GB and LOCALE.CY
  BEFORE_YOU_CONTINUE: '/',
  PAYMENT_CHOICE: '/payment-choice',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  CONTACT_US: '/contact-us',

  // debit card routes, mounted under ROOT within the locale router, see server/routes/debit-card.ts
  DEBIT_CARD: {
    ROOT: '/debit-card',
    DETAILS: '/details',
    AMOUNT: '/amount',
    CHECK: '/check',
  },
}

export default paths
