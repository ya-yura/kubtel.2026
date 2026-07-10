# Design system governance

Дата обновления: 2026-07-10.

## Ownership

| Layer                | Owner              | CMS access              |
| -------------------- | ------------------ | ----------------------- |
| Primitives           | Developer/designer | No                      |
| Semantic tokens      | Developer/designer | No raw editing          |
| Component tokens     | Developer/designer | No raw editing          |
| Compositions         | Developer/designer | Preset selection only   |
| Business aliases     | Developer/designer | Preset selection only   |
| Content status/proof | Editor/reviewer    | Enum/status fields only |

## CMS allowed choices

CMS may store only these governed choices:

- `themeMode`: `light`, `business`;
- `pageAccent`: `default`, `business`, `critical`;
- `heroVariant`: `standard`, `business`, `compact`, `proof-led`;
- `sectionDensity`: `comfortable`, `compact`, `dense`;
- `contentAlignment`: `start`, `center`, `split`;
- `compositionPreset`: `page-intro`, `card-grid`, `service-workspace`, `calculator-workspace`, `contact-grid`, `business-routing`;
- `ctaVariant`: `primary`, `secondary`, `ghost`, `business`, `critical`;
- `serviceCardLayout`: `grid`, `list`, `comparison`;
- `proofVisibility`: `full`, `compact`, `hidden`;
- `statusTone`: `neutral`, `success`, `warning`, `danger`, `info`.

## CMS forbidden values

Do not add fields that accept:

- raw hex/RGB/HSL colors;
- raw px/rem spacing, typography, radius or shadow values;
- arbitrary transition, animation or z-index values;
- custom class names or inline CSS;
- raw HTML for layout;
- direct token references or JSON token blobs.

## Change process

1. Add or change tokens in `src/design/tokens/**`.
2. Run `npm run tokens:build`.
3. Run `npm run design:verify`.
4. Update `/design-system/` if a new component contract is introduced.
5. Update this document and editor-facing docs if CMS preset choices change.
