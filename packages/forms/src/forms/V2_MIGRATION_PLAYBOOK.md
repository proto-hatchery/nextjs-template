# V2 Migration Playbook

This playbook defines how to migrate app screens incrementally to the v2 architecture.

**No app usage migration performed in this implementation.**

## Migration Sequence By Screen Type

1. Simple text-only forms
2. Select + optional IDs forms
3. Searchable/async select forms
4. Patient picker + composite/specialized forms
5. Date/currency/phone domain-heavy forms

## Per-Screen Steps

1. Define/confirm Zod schema with v2 codecs.
2. Switch RHF fields to `useV2ControllerField`.
3. Map controller contracts with `getV2*Props` helpers.
4. Replace screen fields with v2 components only where mapped.
5. Validate empty/optional semantics before visual QA.
6. Run unit tests and screen-level regression checks.

## QA Checklist

- `undefined/null/""` semantics are preserved.
- Blur/touched state updates correctly.
- `ref` focus works on invalid submit.
- Async search keeps selected value after refresh.
- Debounced search triggers expected calls only.
- Grouped option labels remain stable.
- Select-like focus ring/border behavior unchanged.
- Patient selected text placement + avatar accessory unchanged.

## Deferred To Migration Phase

- App-level screen adoption.
- Legacy component removal.
- Compat path deprecation and cleanup after screen migration completion.
