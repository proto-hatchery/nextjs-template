# Fluri Forms v2 Architecture

This document defines the v2 forms architecture for `@workspace/forms`.

## Scope

- Applies to `packages/forms/src/forms/v2/**` and the v2 reusable field surfaces in `@workspace/forms` and `@workspace/ui-kit`.
- Legacy/V1 components may remain temporarily for migration, but they are deprecated and are not a valid forward path.

## Core Decisions

- Form runtime: React Hook Form (`useController`).
- Schema contract: Zod 4 codec-first (single source for input/output transforms).
- Controlled field state, adapter output, and public UI props are separate layers.
- Subpath exports only (`@workspace/ui/forms/v2/*`), no root-barrel additions.

## v2 Kernel

Location: `packages/forms/src/forms/v2/kernel/`

- `types.ts`: canonical field contract and grouped/flat option types.
- `normalization.ts`: `undefined/null/""` normalization rules.
- `field-adapter.ts`: raw normalization helpers used by canonical adapters.
- `controller-props.ts`: typed RHF controller prop shapes.

## Architecture Flow

`Raw Controller / Field State -> Canonical Adapter Layer -> Strict Public UI Props -> External Library Boundary Props`

## Raw Controlled Field Contract

```ts
interface V2ControlledFieldContract<TValue, TElement = HTMLElement> {
  value: TValue;
  onValueChange: (value: TValue) => void;
  onBlur?: () => void;
  name?: string;
  ref?: React.Ref<TElement>;
  error?: FieldError | string | React.ReactNode;
  disabled?: boolean;
}
```

This type is raw controller state. It is not the reusable UI prop contract.

## Canonical Adapter Layer

Location: `packages/forms/src/forms/v2/rhf/`

- `useV2ControllerField`: returns raw controller state as `contract`.
- `getV2InputProps`, `getV2TextareaProps`, `getV2SelectProps`, `getV2SearchSelectProps`, `getV2PatientProps`, `getV2DateProps`, `getV2RadioGroupProps`: convert raw controller state into strict bound props.
- `V2BoundFieldProps` and family-specific bindings describe adapter output.

Adapters own:

- omission of absent optional keys
- `error -> errorMessage` mapping
- element-specific `ref` translation
- value normalization for text/select/date families

## Normalization Rules

- `undefined` and `null` are normalized to `""` for text-like RHF-safe inputs.
- Optional select IDs normalize as:
  - UI empty state: `undefined`
  - RHF-safe transport: `""`
- Empty string for optional selects decodes to `undefined`.

## Zod 4 Schema Layer

Location: `packages/ui/src/forms/v2/schema/`

- `primitives.ts`: domain input/output primitives.
- `codecs.ts`: bidirectional codecs for date/currency/phone/optional select IDs.
- `index.ts`: schema public surface.

## Public Component Contracts

Reusable field components accept strict public props. When they expose a `field` prop, that prop is the adapter output shape, not the raw RHF/controller shape.

Implications:

- App code should prefer `field={getV2InputProps(contract)}` over inline object construction.
- Raw `contract` values should not cross the public component boundary.
- Specialized wrappers should depend on family-specific bound types where applicable.
- Canonical imports should use `/base/v2/` and `/specialized/v2/` subpaths.
- Old shim imports such as `@workspace/forms/components/base/fluri-field-v2-input` are deprecated.

## Component Alignment

Updated v2 fields consume adapter-compatible props without visual redesign:

- `fluri-field-v2-input.tsx`
- `fluri-field-v2-select.tsx`
- `fluri-field-v2-combobox.tsx`
- `fluri-field-v2-select-with-search.tsx`
- `fluri-field-v2-date.tsx`
- `fluri-patient-field-v2.tsx`

Visual constraints preserved:

- Select-like focus/border behavior remains unchanged.
- Patient selected text remains in native text position; avatar remains right accessory.

## Guardrails

- Keep `exactOptionalPropertyTypes` enabled.
- V2 floating-label fields are the only supported reusable form system for new work.
- Do not add new imports from legacy/V1 form component paths.
- Do not reintroduce blanket `?: T | undefined` across public reusable props.
- Do not add competing binding helpers when a canonical adapter already exists.
- Prefer boundary-specific adaptation over shared-contract widening.
