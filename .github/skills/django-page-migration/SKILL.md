---
name: django-page-migration
description: 'Migrate a single page/view from the legacy Django "send money" app (money-to-prisoners-send-money) to the new Express/Nunjucks GOV.UK service (hmpps-prisoner-monies-public-ui). Use when asked to migrate, port, recreate, or rebuild a Django page, view, form, or template as an Express route/handler/Nunjucks page. Covers routing, handlers, GOV.UK Frontend components, Nunjucks templating, form validation, i18n, page view/event auditing, and flags backend/API/business logic as a TODO stub for a separate ticket.'
argument-hint: 'Django view/page to migrate (and target URL path if not obvious)'
---

# Django to Express Page Migration

## Acceptance Criteria
These are the completion goals for every migrated page. Include them in the migration plan and report evidence against each in the final summary; writing code or adding tests alone does not satisfy them. Apply any additional ticket-specific AC too. For the Terms and Conditions page, use these same goals with that page as the subject.

- **Legacy content parity**: the page content matches the rendered legacy page in both languages, including any existing mixed English/Welsh content on `/cy`. Preserve that output rather than tidying, rewriting, or translating it as part of migration.
- **Page-view telemetry**: Azure Application Insights records page views for the migrated page in both locales. Reuse the target application's telemetry setup and verify the page-view recording path with a focused test. Audit logging is a separate requirement, not evidence of Application Insights page-view telemetry; do not claim live Azure ingestion was verified unless it actually was.
- **Welsh rendering**: the `/cy` page renders the existing legacy translations correctly, retaining legacy English fallbacks where applicable. Do not invent translations to make a partially translated legacy page fully Welsh.
- **Passing parity tests**: Playwright parity tests in the configured local parity project compare the migrated page against legacy for both language versions and actually pass. Target-app Playwright integration tests are also required; they do not replace parity tests.
- **Correct links**: all page links, including shared header/footer links, resolve to the intended destinations. Links to pages not yet migrated go to reachable blank/placeholder versions at their intended target routes, not unrelated pages or 404s. Include any placeholder routes in the approved plan.

If an AC cannot be verified (for example, the parity project has not been cloned), report it as blocked/not verified and explain what is missing. Do not mark the migration complete or weaken an assertion to get a pass.

## ⚠️ Plan Approval Required — Always, No Exceptions
This is the most commonly skipped step. It applies on **every** invocation of this skill, regardless of how the request is phrased:
1. Work out the plan (reading whatever source files you need to), then present it to the user as a **high-level bullet-point list** before changing or creating any file: which files will be added/changed, new routes/handlers/templates, i18n keys needed, the `Page`/audit entries, any backend logic that will be flagged as a stub, and any open questions from **When Unsure, Ask**.
2. Explicitly ask the user to choose between a sweeping migration (whole page/flow in one go) or small incremental changes (e.g. routing first, then template, then validation).
3. **Wait for an explicit reply approving the plan** (e.g. "yes", "go ahead", "approved") before calling any file-editing tool. A request that already sounds urgent or says "just do it"/"go ahead and implement" does **not** skip this — restate the plan briefly and get explicit sign-off on it specifically before writing code.
4. The only exception is if the user already approved an identical plan for this exact page earlier in the same conversation.

If you notice you're about to create or edit a file and this hasn't happened yet, stop and go back to step 1.

## Configuration
Project paths are machine-specific, so they're kept out of this committed file and stored instead in a gitignored local config file:

- **File**: `.github/skills/django-page-migration/local-config.json` (relative to the Express target repo). Verify it is gitignored before writing machine-specific absolute paths; do not commit it or store secrets in it.
- **Schema**:
  ```json
  {
    "legacyProjectPath": "/absolute/path/to/money-to-prisoners-send-money",
    "expressProjectPath": "/absolute/path/to/hmpps-prisoner-monies-public-ui",
    "referenceProjectPath": null,
    "parityProjectPath": null
  }
  ```
- `legacyProjectPath`: the Django "send money" app.
  - Views/forms/URLs live under `mtp_send_money/apps/send_money/`, templates under `mtp_send_money/templates/`, translations under `mtp_send_money/translations/<locale>/LC_MESSAGES/django.po`.
- `expressProjectPath`: the Express/Nunjucks target app.
  - Routes/handlers/views/i18n live under `server/`, as detailed in the File Mapping Reference below.
- `referenceProjectPath` (optional): a best-practice example for code style and HTML/CSS/SCSS — not everyone has one. When set, it's expected to be a sibling HMPPS Express/Nunjucks GOV.UK service with the same `assets/scss`/`views` layout, used as a reference because it's further along in adopting current conventions than some pages in this repo.
- `parityProjectPath`: the absolute local path to the separate Playwright legacy-versus-Express parity-test project, not the code-style reference project. Store `null` until it is available. If the user says it is in their workspace, identify the matching workspace folder and confirm it if ambiguous; otherwise ask for its absolute path. Save the confirmed absolute path in this local config so each developer can use their own checkout location. Do not guess a path or clone a project without permission.

See **Step 0** below for how this file is read, validated, and (re)populated.

## When to Use
- Migrating a page from a legacy Django app to its Express/Nunjucks replacement
- Any request to "migrate", "port", or "recreate" a Django view/page/form in a new Express service
- Handles **one page/view at a time** — for a multi-page flow, repeat the procedure per page

## When Unsure, Ask
- If anything is ambiguous, contradictory, or you can't pin down its source — a template variable with no obvious provider, conflicting content between two overrides, an unclear validation rule, which flow a page belongs to, scope of the migration, etc. — **stop and ask the user**. Don't silently guess or pick the "most likely" interpretation.
- This applies at every step: folder/project confirmation, template tracing, translations, validation behaviour, planning, and implementation.

## Before Starting
0. **Resolve the project folders first**, in this order:
  a. Read `.github/skills/django-page-migration/local-config.json` as JSON. Validate that `legacyProjectPath` and `expressProjectPath` are absolute paths to existing directories, and that `referenceProjectPath` and `parityProjectPath`, when set, are too. Reuse valid entries without asking.
  b. If the file is **missing, empty, or invalid JSON**, ask for the legacy and target project folders, an optional code-style reference project, and the parity project. For an existing config, ask only for missing/invalid entries; a missing `parityProjectPath` in an older config must trigger parity setup, not silently skip parity tests. Accept `null` for an unavailable parity project, but flag parity verification as blocked in the plan.
  c. Include any config update in the approval plan. **After explicit approval**, write/update `local-config.json` with the confirmed absolute paths, preserving other valid entries. Verify it is gitignored and explain that these paths stay local. An unavailable parity project does not prevent agreed implementation work, but prevents claiming all AC are met.
1. Which Django view to migrate — find it in `<legacy project>/mtp_send_money/apps/send_money/{views.py,urls.py,forms.py}` and its template under `templates/send_money/`.
2. What URL path the new page should live at (e.g. `/debit-card/amount`) and which feature route file it belongs in.
3. Then follow **⚠️ Plan Approval Required** above before writing any code — it is not optional.

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
(Only begin once the user has explicitly approved the plan — see **⚠️ Plan Approval Required** at the top of this document.)
1. Read the Django view, its form class, and its template in full, reverse-engineering the whole template inheritance/include/tag chain per **Template Tag & Inheritance Tracing** above. Also find and read its legacy tests — `apps/send_money/tests/test_views.py`, `test_forms.py`, and `test_functional.py` — per **Porting Tests** below; they're the source of truth for behaviours/edge cases to preserve, and should be referenced in the plan from **⚠️ Plan Approval Required**.
2. Identify every piece of backend/business logic the view performs (API calls, payment processing, DB/session reads, emails) and any access restriction on it (see **Authentication & Permissions**).
3. Add/extend the route in `server/routes/<feature>.ts`.
4. Write the handler(s) in `server/handlers/<page>.ts`, following the GET-renders / POST-validates-then-redirects pattern.
5. Port form validation into `server/utils/<page>Validation.ts`, matching Django's validation rules and error messages as closely as sensible for GOV.UK error summary conventions.
6. Build the Nunjucks template in `server/views/pages/<page>.njk` using GOV.UK Design System component macros (`govukInput`, `govukDateInput`, `govukButton`, error summary, etc.) — don't hand-roll markup GOV.UK Frontend already provides.
7. If a reference project was confirmed in **Step 0**, check its `server/views/` and `assets/scss/` (components/overrides) for equivalent pages or patterns before writing the template or any new SCSS/JS — prefer matching its conventions over introducing a new one-off style in this repo. Skip this step entirely if no reference project was confirmed.
8. Add page copy per **Static Pages vs Interactive Journey Pages** above — either as per-locale static templates, or as translation keys in both locale `translation.json` files referenced with `t(...)`. Either way, follow **Link Text & Translations** below; never invent a non-English translation.
9. Add a new `Page` entry in `server/constants/pages.ts` and register `auditPageViewRequest({ services, page })` on the GET route so the page view is audited (every migrated page needs this, even if the Django view never recorded one).
10. If the page submits a meaningful business event (search, completed step, etc.), audit it via `auditService.logAuditEvent(...)` from the POST handler or a dedicated middleware (see `auditSearchRequest.ts`) — not needed for purely internal/validation-only POSTs.
11. For any backend/business logic identified in step 2, add a stub (see below) rather than implementing it.
12. Port tests at all three tiers per **Porting Tests** below — Playwright integration coverage is required for every migrated page, regardless of whether a legacy functional test exists.
13. Verify Application Insights page-view telemetry separately from audit logging, following the target application's existing setup. Run the target repo's lint and tests (Jest *and* Playwright), then run the page's bilingual parity checks per **Parity Project Verification**. Report results against every **Acceptance Criteria** item.

## Parity Project Verification
- Read the configured `parityProjectPath` project's instructions, README, package scripts, and nearest existing parity test before editing or running it. Use its existing test framework, fixtures, URL configuration, and comparison helpers rather than inventing a second parity harness in the target app.
- Include parity-project test/config changes and the exact focused verification command in the approval plan. Establish how its configured legacy and Express endpoints are run; ask for any missing setup rather than guessing URLs or using a live payment journey.
- Add/extend the page's parity cases for `en-gb` and `cy`, checking rendered content (including mixed-language legacy output), Welsh rendering, and link destinations. Follow existing normalization for environment-specific origins; do not normalize away meaningful content or destination differences.
- Run the focused Playwright parity tests for both locales and record the command and result. Keep shared-component checks reusable: verify shared footer content/navigation once per applicable locale, then check its presence on the migrated page instead of duplicating the full footer suite on every page.
- If the project or required local services are unavailable, report exactly which parity checks remain blocked. Do not substitute target-only rendering tests or claim parity passed without a successful comparison run.

## Porting Tests
Django test files can't be "moved" directly (different language/framework), but their **scenarios** should be — use the legacy tests as your checklist of behaviours to cover, not as the only reason to write a test. Every migrated page must end up with both Jest and Playwright coverage proving it renders and works, regardless of whether an equivalent legacy test existed:

| Legacy Django test | Express equivalent | What it covers |
|---|---|---|
| `test_forms.py` (form validation cases) | `server/utils/<page>Validation.test.ts` | Pure unit tests of validation logic, no HTTP/Express involved — mirror `prisonerDetailsValidation.test.ts` |
| `test_views.py` (Django test-client view tests) | `server/handlers/<page>.test.ts` | Unit tests of the handler function with mocked `req`/`res`/services — mirror `handlers/prisonerDetails.test.ts` (uses `testutils/mockResponse`) |
| `test_views.py` / `test_views_misc.py` (end-to-end-ish Django client assertions) | Additions to `server/routes/index.test.ts` | Supertest requests through the real app/router/templates — asserts on rendered HTML, redirects, and audit calls, like the existing `describe.each` blocks |
| `test_functional.py` (Selenium browser tests), or nothing if no legacy functional test exists | A Playwright spec under `integration_tests/specs/` | **Mandatory for every migrated page** — see **Playwright Integration Tests** below |

- Where legacy tests cover translated (`cy`) behaviour, keep that coverage in both the Jest and Playwright equivalents, per **Link Text & Translations**.
- If a legacy unit-level test tier genuinely doesn't apply (e.g. a static page has no form to validate), it's fine to skip that one Express tier, but say so in your summary — the Playwright tier is never skipped.

## Playwright Integration Tests
Every migrated page needs a Playwright spec under `integration_tests/specs/` proving it renders with its key components visible *and* functional — not just that the route returns 200. Follow the conventions already in this folder (`sendMoney.spec.ts`, `footer.spec.ts`, `health.spec.ts`):
- **Where the spec lives**: add to the existing spec file for that journey/feature if the page is part of an existing flow (e.g. another debit-card step → `sendMoney.spec.ts`), or create a new `integration_tests/specs/<feature>.spec.ts` for a standalone feature/component (mirroring `footer.spec.ts`). Ask the user if it's not obvious which.
- **Page objects**: for any page with interactive elements (form fields, buttons, non-trivial links), add a page object in `integration_tests/pages/<page>.ts` extending `BasePage` (`integration_tests/utils/basePage.ts`), mirroring `prisonerDetailsPage.ts` / `beforeYouContinuePage.ts` — expose locators as readonly properties, not raw strings scattered through the spec. Simple cross-cutting checks (like the footer) can query locators directly without a dedicated page object.
- **What "visible and functional" means, at minimum**:
  - The page's `<h1>`/primary heading is visible.
  - Every form field, button, and link present in the Nunjucks template is visible and has the correct accessible name/label.
  - For form pages: a happy-path test that fills in valid data, submits, and asserts the resulting redirect/page; *and* at least one validation-error test (invalid/missing input) asserting the error summary and field-level errors appear.
  - For links (including ones in shared partials like the footer/header): clicking navigates to the correct destination page and its heading is visible, per **Link Text & Translations**.
- **Authentication**: if **Authentication & Permissions** determined the route needs an HMPPS Auth role, the spec must call `login(page, { roles: ['ROLE_X'] })` from `integration_tests/testUtils.ts` before visiting the page, and stub any required mock APIs under `integration_tests/mockApis/` (wiremock-based) — don't assume an unauthenticated `page.goto()` will work.
- **Locale coverage**: run the spec for every supported locale (`en-gb`, `cy`) the page supports, per the `[locale]`-prefixed test title pattern in `footer.spec.ts`.
- Lint (`npx eslint`) and typecheck (`npx tsc -p integration_tests --noEmit`) the spec, then actually run it (`npm run int-test`, optionally `-- --grep '<name>'`) before considering the migration done — don't just write it and assume it passes.

## Authentication & Permissions
Django's auth model (session login, `@login_required`, `permission_required(...)`, `PermissionRequiredMixin`/`UserPassesTestMixin`, group/permission checks) and Express's (JWT bearer tokens with `ROLE_`-prefixed authorities via `authorisationMiddleware`, currently commented out in `app.ts` because every migrated page so far is public) are **not equivalent** — there's no mechanical 1:1 mapping between them.
- **Check every Django view for an access restriction**, not just the obvious payment/form logic — login/permission decorators or mixins, a custom `user_passes_test`, IP allowlisting, or any other gate on who can reach the page.
- **Don't silently drop or silently enforce any restriction you find.** A restricted Django view breaks the "fully public" assumption the rest of this skill makes — stop and ask the user which HMPPS Auth role(s), if any, should gate the Express route. Which role applies is a product/security decision, not something to infer from the Django code.
- If the user confirms a role is needed, wire it up via `authorisationMiddleware(['ROLE_X'])` on that route (uncommenting/enabling it in `app.ts` if this is the first authenticated route), and call this out clearly in both your plan and final summary — it's a notable change to a currently fully-public service.
- If the Django view has no access restriction (true for every page in `send_money` at the time of writing), do nothing — don't add `authorisationMiddleware` speculatively.

## Flagging Backend Logic
When a Django view relies on logic not yet implemented in Express (API calls, GOV.UK Pay/Notify, prisoner balance checks, etc.):
- Add a method to the relevant `server/services/*Service.ts` class with a realistic signature, but have it return mock/placeholder data (mirror `SendMoneyToPrisonerService.getValidPrisoner`).
- Add a single-line `// TODO: implement via <ticket>` comment above the stub (use the ticket reference if the user gave one, otherwise leave `<ticket>` as a literal placeholder).
- Keep the stub obviously temporary — don't throw, silently fail, or fake success in a way that masks the missing implementation.
- Call out every flagged stub in your final summary to the user so it can be tracked.

## Completion Checklist
- [ ] Every **Acceptance Criteria** item has verification evidence; unmet or blocked criteria are explicitly reported, not marked complete
- [ ] Local project paths are validated, including `parityProjectPath`; confirmed updates are saved in the gitignored local config after approval
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
- [ ] Application Insights page-view recording is verified separately from audit logging for both locales; live-ingestion verification is not claimed without evidence
- [ ] Meaningful submitted events (if any) are audited via `auditService.logAuditEvent`
- [ ] Checked the Django view for auth/permission restrictions (**Authentication & Permissions**) — confirmed with the user, not assumed either way
- [ ] Legacy Django tests were read and used as the source of test scenarios (**Porting Tests**)
- [ ] Jest unit tests added for handler/validation/service as applicable
- [ ] A Playwright spec was added/extended under `integration_tests/specs/` covering key components' visibility and functionality, for every supported locale (**Playwright Integration Tests**) — and was actually run, not just written
- [ ] Playwright parity tests in the configured parity project pass for both English and Welsh, preserving legacy mixed-language content and checking intended link destinations/placeholders
- [ ] Backend/API logic is stubbed with a `TODO` comment, not implemented
- [ ] Lint and tests pass (Jest and Playwright)
