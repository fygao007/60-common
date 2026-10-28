# Project Instructions

Before modifying `ui-demo`, read and follow:

1. `AGENTS.md`
2. `ui-demo/AI_COMPONENT_USAGE.md`
3. `ui-demo/templates/react-business-page/README.md` for business pages
4. The relevant component source and specification

Business-page rules are mandatory:

- Use a `<name>.page.jsx` React entry and import components only from `@wisedu/design-system`.
- Keep HTML limited to Framework 2 configuration and the generated bundle.
- Do not write native `button`, `input`, `select`, `textarea`, or `table` elements in business JSX.
- Do not copy `.ds-*`, `.frame2-*`, or legacy `ap-*` component internals.
- Files listed in `ui-demo/specs/legacy-static-pages.json` are read-only. Migrate them before changing them.
- Run `npm run validate` after every UI change.
- Run `npm run test:business-pages` after changing a business page.

For modal, drawer, or edit-form work, the canonical machine-readable source is:

`ui-demo/packages/design-system/specs/edit-overlay-templates.json`
