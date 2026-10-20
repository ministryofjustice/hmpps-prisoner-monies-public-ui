---
name: django-page-migration
description: 'Migrate a single page/view from the legacy Django "send money" app (money-to-prisoners-send-money) to the new Express/Nunjucks GOV.UK service (hmpps-prisoner-monies-public-ui). Use when asked to migrate, port, recreate, or rebuild a Django page, view, form, or template as an Express route/handler/Nunjucks page. Covers routing, handlers, GOV.UK Frontend components, Nunjucks templating, form validation, i18n, page view/event auditing, and flags backend/API/business logic as a TODO stub for a separate ticket.'
argument-hint: 'Django view/page to migrate (and target URL path if not obvious)'
---

# Django to Express Page Migration

## Configuration
These are the defaults for this `prisoner-money` workspace. **Don't assume they apply** — if any of these folders aren't present when the skill is invoked (only one repo is open, paths differ, or this is a different workspace entirely), ask the user to confirm all three before doing anything else (see **Step 0** below).

- **Legacy Django project** (source): `money-to-prisoners-send-money`
  - Views/forms/URLs live under `mtp_send_money/apps/send_money/`, templates under `mtp_send_money/templates/`, translations under `mtp_send_money/translations/<locale>/LC_MESSAGES/django.po`.
- **Express target project**: `hmpps-prisoner-monies-public-ui`
  - Routes/handlers/views/i18n live under `server/`, as detailed in the File Mapping Reference below.
- **Reference project** (best-practice example for code style and HTML/CSS/SCSS, optional): `~/Documents/Git/probation/hmpps-probation-check-in-ui`
  - Not everyone has a reference project — ask "do you have a reference project for code/style conventions?" if this one isn't available, and skip the reference-project step below if they say no.
  - This is a sibling HMPPS Express/Nunjucks GOV.UK service built on the same template (same `assets/scss` and `views` layout), kept here as a reference because it's further along in adopting current conventions than some pages in this repo.
  - Update this default if the team adopts a different reference project.

## When to Use
- Migrating a page from a legacy Django app to its Express/Nunjucks replacement
- Any request to "migrate", "port", or "recreate" a Django view/page/form in a new Express service
- Handles **one page/view at a time** — for a multi-page flow, repeat the procedure per page

## When Unsure, Ask
- If anything is ambiguous, contradictory, or you can't pin down its source — a template variable with no obvious provider, conflicting content between two overrides, an unclear validation rule, which flow a page belongs to, scope of the migration, etc. — **stop and ask the user**. Don't silently guess or pick the "most likely" interpretation.
- This applies at every step: folder/project confirmation, template tracing, translations, validation behaviour, planning, and implementation.

## Before Starting
0. **Confirm the project folders first.** Check whether the Configuration defaults above exist in the current workspace:
   - If they do, use them without asking.
   - If they don't (different workspace, renamed/missing folders, or the skill is being run outside this setup), stop and ask the user for: the legacy Django project folder, the target Express project folder, and (optionally) a reference project for code/HTML/CSS style conventions — don't guess paths or invent a reference project.
1. Which Django view to migrate — find it in `<legacy project>/mtp_send_money/apps/send_money/{views.py,urls.py,forms.py}` and its template under `templates/send_money/`.
2. What URL path the new page should live at (e.g. `/debit-card/amount`) and which feature route file it belongs in.
3. **Propose a plan and wait for approval — do not write any code yet.** Lay out the migration as a high-level bullet-point plan: which files will be added/changed, new routes/handlers/templates, i18n keys needed, the `Page`/audit entries, any backend logic that will be flagged as a stub, and any open questions from **When Unsure, Ask**. Present this so the user can decide whether they want a sweeping migration (whole page/flow in one go) or small incremental changes (e.g. routing first, then template, then validation). Only proceed to the Procedure below once the user explicitly agrees to the plan.

## File Mapping Reference

| Django (source) | Express (target) | Notes |
|---|---|---|
| `urls.py` `re_path(...)` entry | `server/routes/<feature>.ts` — add `router.get/post(...)` | Group by feature, matching existing files like `routes/debit-card.ts` |
| `views.py` View class (`get`/`post`/`form_valid`) | `server/handlers/<page>.ts` exporting `xGetHandler` / `xPostHandler(services...)` | Mirror naming/shape in `handlers/prisonerDetails.ts` |
| `forms.py` Form + `clean_*` methods | `server/utils/<page>Validation.ts` exporting `validateX(formValues)` returning `{ errors, errorList }` | Mirror `utils/prisonerDetailsValidation.ts`; preserve Django's error messages/ordering where reasonable |
| `templates/send_money/*.html` (Django tags + `govuk_frontend_jinja` macros) | `server/views/pages/*.njk` using `govuk-frontend` macros (`govuk/components/.../macro.njk`) | Keep the two-thirds layout via `{% extends "../partials/layout-two-thirds.njk" %}` unless the page needs full width |
| Page copy (English + translated) | Either per-locale static templates **or** `t("namespace.key")` i18n keys | Depends on page type — see **Static Pages vs Interactive Journey Pages** below |
| Session-stored form state (`unserialise_from_session`) | Express session (`req.session`) / `res.locals`, per existing pattern in the target repo | Check how already-migrated pages persist state before introducing a new pattern |
| Calls to `money-to-prisoners-api`, GOV.UK Pay, GOV.UK Notify (`payments.py`, `utils.py`, `mail.py`) | Stub method on a `server/services/*Service.ts` class | **Flag, don't implement** — see below |
| (Django doesn't audit page views) | `auditPageViewRequest({ services, page: Page.X })` middleware on the GET route | Add a new entry to the `Page` enum in `server/constants/pages.ts`; mirror usage in `routes/index.ts` |
| (Django doesn't audit form submissions/searches) | `auditService.logAuditEvent({ correlationId: req.id, who, what, subjectType, subjectId, details })` called from the POST handler, or a dedicated middleware like `auditSearchRequest` | Only needed where the submission is a meaningful business event (e.g. a search, a completed step) — not every POST |

## Static Pages vs Interactive Journey Pages
Not every migrated page should use `t(...)` translation keys — choose the approach based on the page's content, and ask the user if it's not obvious which bucket a page falls into:
- **Heavy, static, prose-heavy pages** (terms and conditions, privacy policy, accessibility statement, cookies policy, and similar legal/policy pages): migrate as **separate per-locale templates** with each locale's full prose written directly into its own file — `server/views/pages/en-gb/<page>.njk` and `server/views/pages/cy/<page>.njk` — mirroring the existing `terms.njk` / `privacy.njk` pattern. Don't break this kind of content into dozens of `t()` keys; copy each locale's legacy prose verbatim into its file (see **Link Text & Translations** for sourcing the Welsh text).
- **Minimal-text, interactive journey pages** (forms, payment steps, prompts, confirmations, error pages): migrate using `t("namespace.key")` i18n keys added to both `translation.json` files, per the existing pattern (`before-you-continue.njk`, `not-found.njk`, `payment-amount.njk`).
- **If a page mixes both** (e.g. a form preceded by a few paragraphs of legal-style text), **ask the user** which approach they want before building the template rather than picking one yourself.

## Link Text & Translations
- **Copy link/button/label text verbatim from the legacy source** — read the actual Django template or form field, don't paraphrase (e.g. "Terms and conditions", not "Terms & Conditions" or "T&Cs").
- **Trust the legacy anchor tag's target as correct.** Assume the URL/route a legacy `<a href>` or `{% url %}` tag points to is intentional and should be migrated as-is — don't invent a different destination, "fix", or reorganise it. If a target page hasn't been migrated to Express yet, create a placeholder page for it (see the footer migration precedent) rather than dropping or redirecting the link elsewhere.
- **Verify every anchor tag you migrate**, including ones in shared partials/layouts the page pulls in (per **Template Tag & Inheritance Tracing** below) — check the resolved `href` actually matches what the legacy `{% url %}`/reverse lookup resolves to, not just what it looks like in the raw template.
- **Never invent or auto-generate a translation.** For non-English locales (`cy`), copy the exact existing translation from the legacy project's translation catalogue:
  - `money-to-prisoners-send-money/mtp_send_money/translations/<locale>/LC_MESSAGES/django.po` — search for the English text as a `msgid` and use its `msgstr`
  - Shared/library strings (header, footer, common components) may instead live in the installed `mtp_common` package — check `money-to-prisoners-send-money/venv/lib/*/site-packages/mtp_common/` if the string isn't in the local `django.po`
- **If no legacy translation can be found** (brand-new placeholder copy, or the string's source is an untranslated dependency), leave the English text in that locale's `translation.json` too and call it out in your final summary as needing a professional translation — do not guess or machine-translate it yourself.
- This applies even to short, "obvious" strings like page titles — only use a Welsh (or other locale) string once you've found its verbatim match in an existing `.po` file.

## Template Tag & Inheritance Tracing
Django/Jinja2 templates in the legacy app rarely contain the full picture in one file — a page's real rendered output is assembled from template inheritance, block overrides, includes, custom tags, and context processors. **Always reverse-engineer the full chain below before writing the Express template** — skimming only the page's own `.html` file risks silently missing content, conditional branches, or the wrong data source:
- **Follow the full `{% extends %}` chain**, not just the first hop. Local templates often extend `templates/base.html`, which itself extends a base template from the installed `mtp_common` package — find that package under `money-to-prisoners-send-money/venv/lib/*/site-packages/mtp_common/templates/` and read it too.
- **Resolve every `{% block %}` the page overrides against its parent's block definitions.** A block can be empty/default in the parent template and only get real content from a child override several inheritance levels away (or vice versa) — check both ends, don't assume the override you found is the only one in play.
- **Follow every `{% include %}`** to the included template's actual content, including includes inside `mtp_common`.
- **Read any custom template tags/filters** referenced via `{% load ... %}` — find their Python implementation in the local app's `templatetags/` or the installed package, since they can render conditional/dynamic markup that isn't visible from the HTML alone.
- **Check `context_processors.py`** (and any other context processors registered in Django settings) for every variable the template references (e.g. `{{ some_var }}` or `{% if some_var %}`). Don't assume a context processor that defines a plausible-looking variable is actually the one powering the template — verify the variable name is the exact one the template reads, and check whether the variable is actually used anywhere (unused/dead context processors do exist).
- **Trace `{% if %}` / `{% for %}` conditions against real settings/feature flags**, not just whichever branch appears first, so you migrate the branch that's actually reachable in production.
- Do this *before* building the Express route/handler/template (feeds into Procedure step 1 below). If a template variable or tag's source can't be found, say so explicitly in your final summary rather than guessing what it renders.

## Procedure
(Only begin once the user has approved the plan from **Before Starting** step 3.)
1. Read the Django view, its form class, and its template in full, reverse-engineering the whole template inheritance/include/tag chain per **Template Tag & Inheritance Tracing** above.
2. Identify every piece of backend/business logic the view performs (API calls, payment processing, DB/session reads, emails).
3. Add/extend the route in `server/routes/<feature>.ts`.
4. Write the handler(s) in `server/handlers/<page>.ts`, following the GET-renders / POST-validates-then-redirects pattern.
5. Port form validation into `server/utils/<page>Validation.ts`, matching Django's validation rules and error messages as closely as sensible for GOV.UK error summary conventions.
6. Build the Nunjucks template in `server/views/pages/<page>.njk` using GOV.UK Design System component macros (`govukInput`, `govukDateInput`, `govukButton`, error summary, etc.) — don't hand-roll markup GOV.UK Frontend already provides.
7. If a reference project was confirmed in **Step 0**, check its `server/views/` and `assets/scss/` (components/overrides) for equivalent pages or patterns before writing the template or any new SCSS/JS — prefer matching its conventions over introducing a new one-off style in this repo. Skip this step entirely if no reference project was confirmed.
8. Add page copy per **Static Pages vs Interactive Journey Pages** above — either as per-locale static templates, or as translation keys in both locale `translation.json` files referenced with `t(...)`. Either way, follow **Link Text & Translations** below; never invent a non-English translation.
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
- [ ] Plan was presented as bullet points and explicitly approved by the user before any code was written
- [ ] Full template inheritance/include/tag chain traced per **Template Tag & Inheritance Tracing** (not just the page's own `.html` file)
- [ ] Route registered and reachable at the correct path
- [ ] Handler covers GET (render) and POST (validate + redirect) where the Django view did
- [ ] Validation mirrors Django's rules/messages
- [ ] Template uses GOV.UK Frontend macros, not raw HTML for form controls
- [ ] Template/SCSS/JS checked against the reference project (if one was confirmed in Step 0) and follows its conventions rather than inventing new ones
- [ ] Page copy follows **Static Pages vs Interactive Journey Pages** (static prose pages get per-locale templates; journey pages use `t("...")` keys added to `en-gb` and `cy` locale files)
- [ ] Link/button text matches the legacy wording verbatim, every anchor's target matches the legacy `href`/`{% url %}` resolution (migrated as-is, not redesigned), and every non-English translation is copied from an existing legacy `.po` file (not invented) — unmatched strings are left in English and flagged
- [ ] Page view is audited (`Page` enum entry + `auditPageViewRequest` on the GET route)
- [ ] Meaningful submitted events (if any) are audited via `auditService.logAuditEvent`
- [ ] Backend/API logic is stubbed with a `TODO` comment, not implemented
- [ ] Tests added/updated for handler, validation, and any new service methods
- [ ] Lint and tests pass
