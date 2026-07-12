# Catalogs Module

Read-only catalogs module for global reference data (`reference_values` + `catalog_clinical_activities`) using clean architecture boundaries.

## Structure

```txt
modules/catalogs/
├── domain/
│   ├── dto/reference-value.dto.ts
│   └── ports/catalog-repository.port.ts
└── infrastructure/
    ├── mappers/reference-value.mapper.ts
    └── repositories/catalog-supabase.repository.ts
```

## Usage

- Server actions live in `src/actions/catalogs/*`.
- Actions use `createAction(...)` + `serializeResult(...)`.
- Query keys are reused from `src/utils/query-keys.ts` (`queryKeys.catalogs.*`).

```ts
import { getAllCatalogsAction } from "@workspace/supabase/actions/catalogs/get-all-catalogs";

const result = await getAllCatalogsAction({});
if (result.success) {
  console.log(result.data.services);
}
```
