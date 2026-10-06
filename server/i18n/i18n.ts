import path from 'path'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import middleware from 'i18next-http-middleware'
import logger from '../../logger'

export const SUPPORTED_LANGUAGES = ['en', 'cy'] as const
export const DEFAULT_LANGUAGE = 'en'

// Reads translations lazily from disk, so migrating a language is just adding a
// `server/i18n/locales/<lng>/translation.json` file - no code changes needed.
export const i18nextInitPromise = i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.json'),
    },
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    preload: SUPPORTED_LANGUAGES,
    defaultNS: 'translation',
    // Language is chosen via the /en-gb/ and /cy/ URL prefixes (see routes/index.ts), not a query param.
    detection: {
      order: ['cookie', 'header'],
      lookupCookie: 'lng',
      caches: ['cookie'],
    },
    interpolation: {
      escapeValue: false, // nunjucks already escapes output
    },
  })
  .catch((error: Error) => logger.error(error, 'Failed to initialise i18next'))

export default i18next
