---
name: django-page-migration
description: 'Migrate a single page/view from the legacy Django "send money" app (money-to-prisoners-send-money) to the new Express/Nunjucks GOV.UK service (hmpps-prisoner-monies-public-ui). Use when asked to migrate, port, recreate, or rebuild a Django page, view, form, or template as an Express route/handler/Nunjucks page. Covers routing, handlers, GOV.UK Frontend components, Nunjucks templating, form validation, i18n, page view/event auditing, and flags backend/API/business logic as a TODO stub for a separate ticket.'
argument-hint: 'Django view/page to migrate (and target URL path if not obvious)'
---

# Django to Express Page Migration

## Configuration
- **Reference project** (best-practice example for code style and HTML/CSS/SCSS, optional): `/Users/alex.stockford/Documents/Git/probation/hmpps-probation-check-in-ui`
  - Leave this value blank to skip the reference-project step below.
  - This is a sibling HMPPS Express/Nunjucks GOV.UK service built on the same template (same `assets/scss` and `views` layout), kept here as a reference because it's further along in adopting current conventions than some pages in this repo.
  - Update this path if the team adopts a different reference project.

## When to Use
- Migrating a page from `money-to-prisoners-send-money` (Django) to its Express/Nunjucks replacement in `hmpps-prisoner-monies-public-ui`
- Any request to "migrate", "port", or "recreate" a Django view/page/form in the new service
- Handles **one page/view at a time** — for a multi-page flow, repeat the procedure per page

## Before Starting
Confirm with the user if not already clear from the request:
1. Which Django view to migrate — find it in `money-to-prisoners-send-money/mtp_send_money/apps/send_money/{views.py,urls.py,forms.py}` and its template under `templates/send_money/`.
2. What URL path the new page should live at (e.g. `/debit-card/amount`) and which feature route file it belongs in.

## File Mapping Reference

| Django (source) | Express (target) | Notes |
|---|---|---|
| `urls.py` `re_path(...)` entry | `server/routes/<feature>.ts` — add `router.get/post(...)` | Group by feature, matching existing files like `routes/debit-card.ts` |
| `views.py` View class (`get`/`post`/`form_valid`) | `server/handlers/<page>.ts` exporting `xGetHandler` / `xPostHandler(services...)` | Mirror naming/shape in `handlers/prisonerDetails.ts` |
| `forms.py` Form + `clean_*` methods | `server/utils/<page>Validation.ts` exporting `validateX(formValues)` returning `{ errors, errorList }` | Mirror `utils/prisonerDetailsValidation.ts`; preserve Django's error messages/ordering where reasonable |
| `templates/send_money/*.html` (Django tags + `govuk_frontend_jinja` macros) | `server/views/pages/*.njk` using `govuk-frontend` macros (`govuk/components/.../macro.njk`) | Keep the two-thirds layout via `{% extends "../partials/layout-two-thirds.njk" %}` unless the page needs full width |
| Hardcoded English strings in Django templates | i18n keys via `t("namespace.key")`, added to **both** `server/i18n/locales/en-gb/translation.json` and `server/i18n/locales/cy/translation.json` | Follow `not-found.njk` / `layout.njk` — do not hardcode copy like the older `prisoner-details.njk` does |
| Session-stored form state (`unserialise_from_session`) | Express session (`req.session`) / `res.locals`, per existing pattern in the target repo | Check how already-migrated pages persist state before introducing a new pattern |
| Calls to `money-to-prisoners-api`, GOV.UK Pay, GOV.UK Notify (`payments.py`, `utils.py`, `mail.py`) | Stub method on a `server/services/*Service.ts` class | **Flag, don't implement** — see below |
| (Django doesn't audit page views) | `auditPageViewRequest({ services, page: Page.X })` middleware on the GET route | Add a new entry to the `Page` enum in `server/constants/pages.ts`; mirror usage in `routes/index.ts` |
| (Django doesn't audit form submissions/searches) | `auditService.logAuditEvent({ correlationId: req.id, who, what, subjectType, subjectId, details })` called from the POST handler, or a dedicated middleware like `auditSearchRequest` | Only needed where the submission is a meaningful business event (e.g. a search, a completed step) — not every POST |

## Link Text & Translations
- **Copy link/button/label text verbatim from the legacy source** — read the actual Django template or form field, don't paraphrase (e.g. "Terms and conditions", not "Terms & Conditions" or "T&Cs").
- **Never invent or auto-generate a translation.** For non-English locales (`cy`), copy the exact existing translation from the legacy project's translation catalogue:
  - `money-to-prisoners-send-money/mtp_send_money/translations/<locale>/LC_MESSAGES/django.po` — search for the English text as a `msgid` and use its `msgstr`
  - Shared/library strings (header, footer, common components) may instead live in the installed `mtp_common` package — check `money-to-prisoners-send-money/venv/lib/*/site-packages/mtp_common/` if the string isn't in the local `django.po`
- **If no legacy translation can be found** (brand-new placeholder copy, or the string's source is an untranslated dependency), leave the English text in that locale's `translation.json` too and call it out in your final summary as needing a professional translation — do not guess or machine-translate it yourself.
- This applies even to short, "obvious" strings like page titles — only use a Welsh (or other locale) string once you've found its verbatim match in an existing `.po` file.

## Procedure
1. Read the Django view, its form class, and its template in full.
2. Identify every piece of backend/business logic the view performs (API calls, payment processing, DB/session reads, emails).
3. Add/extend the route in `server/routes/<feature>.ts`.
4. Write the handler(s) in `server/handlers/<page>.ts`, following the GET-renders / POST-validates-then-redirects pattern.
5. Port form validation into `server/utils/<page>Validation.ts`, matching Django's validation rules and error messages as closely as sensible for GOV.UK error summary conventions.
6. Build the Nunjucks template in `server/views/pages/<page>.njk` using GOV.UK Design System component macros (`govukInput`, `govukDateInput`, `govukButton`, error summary, etc.) — don't hand-roll markup GOV.UK Frontend already provides.
7. If a reference project is set in **Configuration**, check its `server/views/` and `assets/scss/` (components/overrides) for equivalent pages or patterns before writing the template or any new SCSS/JS — prefer matching its conventions over introducing a new one-off style in this repo.
8. Add translation keys to both locale `translation.json` files and reference them with `t(...)` in the template instead of hardcoding English copy — follow **Link Text & Translations** above; never invent a non-English translation.
9. Add a new `Page` entry in `server/constants/pages.ts` and register `auditPageViewRequest({ services, page })` on the GET route so the page view is audited (every migrated page needs this, even if the Django view never recorded one).
10. If the page submits a meaningful business event (search, completed step, etc.), audit it via `auditService.logAuditEvent(...)` from the POST handler or a dedicated middleware (see `auditSearchRequest.ts`) — not needed for purely internal/validation-only POSTs.
11. For any backend/business logic identified in step 2, add a stub (see below) rather than implementing it.
12. Write Jest tests alongside the new files (`<page>.test.ts` for handlers, `<x>Validation.test.ts` for validation, `<x>Service.test.ts` for services), following existing test file conventions in the repo.
13. Run the target repo's lint and tests to confirm nothing is broken.

## Flagging Backend Logic
When a Django view relies on logic not yet implemented in Express (API calls, GOV.UK Pay/Notify, prisoner balance checks, etc.):
- Add a method to the relevant `server/services/*Service.ts` class with a realistic signature, but have it return mock/placeholder data (mirror `SendMoneyToPrisonerService.getValidPrisoner`).
- Add a single-line `// TODO: implement via <ticket>` comment above the stub (use the ticket reference if the user gave one, otherwise leave `<ticket>` as a literal placeholder).
- Keep the stub obviously temporary — don't throw, silently fail, or fake success in a way that masks the missing implementation.
- Call out every flagged stub in your final summary to the user so it can be tracked.

## Completion Checklist
- [ ] Route registered and reachable at the correct path
- [ ] Handler covers GET (render) and POST (validate + redirect) where the Django view did
- [ ] Validation mirrors Django's rules/messages
- [ ] Template uses GOV.UK Frontend macros, not raw HTML for form controls
- [ ] Template/SCSS/JS checked against the reference project (if configured) and follows its conventions rather than inventing new ones
- [ ] All page copy goes through `t("...")`, added to `en-gb` and `cy` locale files
- [ ] Link/button text matches the legacy wording verbatim, and every non-English translation is copied from an existing legacy `.po` file (not invented) — unmatched strings are left in English and flagged
- [ ] Page view is audited (`Page` enum entry + `auditPageViewRequest` on the GET route)
- [ ] Meaningful submitted events (if any) are audited via `auditService.logAuditEvent`
- [ ] Backend/API logic is stubbed with a `TODO` comment, not implemented
- [ ] Tests added/updated for handler, validation, and any new service methods
- [ ] Lint and tests pass
