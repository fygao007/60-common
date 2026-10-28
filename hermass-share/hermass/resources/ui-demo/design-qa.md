# Design QA — 流程动态组件

## Comparison target

- Source visual: `/var/folders/t9/rmj5qtfs65xffrhbfxxxmgxw0000gn/T/codex-clipboard-a54b5514-56de-412e-a66c-5c6d754758f5.png` (1440 × 828 px); drawer state: `/var/folders/t9/rmj5qtfs65xffrhbfxxxmgxw0000gn/T/codex-clipboard-35d7a105-d21d-414e-82da-298f5a7030ec.png` (1440 × 828 px); state variations: `/var/folders/t9/rmj5qtfs65xffrhbfxxxmgxw0000gn/T/codex-clipboard-3e637bfe-fcf7-46a2-b2bf-fe39798de41a.png` (913 × 668 px); graph guidance: `/var/folders/t9/rmj5qtfs65xffrhbfxxxmgxw0000gn/T/codex-clipboard-c3036c62-a17a-455b-8ad2-a8baf2637915.png` (2432 × 4279 px).
- Implementation target: `demos/teacher-growth-portfolio/teacher/mp-plan-audit-detail/mp-plan-audit-detail.html` and `demos/teacher-growth-portfolio/teacher/mp-plan-list/mp-plan-list.html`.
- Implementation screenshot: not captured. The selected in-app browser blocks `file://` URLs; the browser policy disallows using a local web server or another browser surface to bypass that restriction.
- Intended comparison viewport: 1440 × 828 CSS px, device scale factor 1. The drawer should be compared in its open `流程动态` state, then `流程图` state.

## Evidence and findings

- Full-view comparison: blocked; the implementation could not be opened in the selected browser.
- Focused comparison: the source's right timeline panel and half-width drawer are visible in the supplied screenshots, but corresponding implementation regions could not be captured.
- Functional checks: build completed; timeline expansion, table entry, and drawer tab interactions were not browser-tested.
- Required fidelity surfaces (typography, spacing/layout, color tokens, image quality, and copy): source screenshots reviewed; implementation comparison remains blocked for all five surfaces.

## Blocking finding

- [P1] Rendered implementation evidence is unavailable.
  - Location: process panel on the plan audit detail page and process drawer on the plan list page.
  - Evidence: the browser accepts only HTTP(S), while the page is a local file; policy forbids routing around this restriction.
  - Impact: visual parity and primary interactions cannot be confirmed.
  - Fix: user opens the two local pages in their own browser and provides screenshots of the right panel and the drawer's timeline/graph states for a follow-up comparison.

## Validation summary

- `npm run build:previews`: passed.
- `npm run validate:product-world`: passed.
- `npm run validate:page-compositions`: passed.
- `npm run validate:framework2`: passed.
- `npm run validate:edit-overlays`: passed.
- `npm run validate:business-pages`: blocked by 502 repository-wide baseline issues, including pre-existing shared-directory imports in the two modified pages.
- `npm run validate:links`: blocked by 15 existing unrelated local-link errors.
- `npm run validate:field-ontology`: blocked by existing inline table-column definitions in several pages, including the existing plan list.
- `npm run validate:no-overlay-internals`: blocked by existing violations in unrelated pages.
- `npm run validate`: failed at the existing local-link check.

## Final result

blocked
