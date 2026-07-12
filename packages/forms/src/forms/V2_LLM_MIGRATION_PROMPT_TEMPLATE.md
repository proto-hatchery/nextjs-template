# V2 LLM Migration Prompt Template

Use this template to migrate one screen to v2 architecture.

## Prompt Template

You are migrating one Fluri screen to forms v2.

Requirements:

1. Use RHF + Zod 4 codec-first architecture.
2. Use `@workspace/ui/forms/v2/rhf` helpers.
3. Keep UX unchanged.
4. Preserve optional empty semantics (`undefined/null/""`).
5. No root-barrel imports.

Task steps:

1. Read existing screen form schema and fields.
2. Convert schema to use codecs from `@workspace/ui/forms/v2/schema`.
3. Replace controller wiring with `useV2ControllerField`.
4. Map props with `getV2InputProps/getV2SelectProps/getV2SearchSelectProps/getV2PatientProps/getV2DateProps`.
5. Keep field visuals and copy unchanged.
6. Add/adjust tests for normalization and field wiring.
7. Report changed files and migration risks.

## Required Output Sections

1. Changed files
2. Contract mapping summary
3. Codec usage summary
4. QA checklist results
5. Deferred follow-ups

## Anti-Patterns To Avoid

- Injecting ad-hoc conversion logic inside screen components.
- Using compat wrappers as primary path for new screens.
- Implicitly coercing `undefined/null/""`.
- Altering select/patient UX behavior during migration.
