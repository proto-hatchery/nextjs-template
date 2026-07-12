# V2 Field Contracts

## Contract Shape

All v2 controlled fields use:

- `value`
- `onValueChange`
- `onBlur`
- `name`
- `ref`
- `error`
- `disabled`

## Value Semantics

### Text-like fields

- Input receives string values.
- `undefined`/`null` normalize to `""`.

### Optional select-like fields

- Field value in UI: `string | undefined`.
- RHF-safe empty transport: `""`.
- `""` decodes back to `undefined`.

### Date field

- UI value: masked string `DD/MM/YYYY`.
- Codec output: `Date | undefined`.

### Currency field

- UI value: localized formatted string.
- Codec output: `number | undefined`.

### Phone field

- UI value: display string.
- Codec output: normalized E.164 string (`+...`) or `undefined`.

## RHF Mapping Example

```tsx
const { contract } = useV2ControllerField({
  control,
  name: "patientId",
  mode: "optional-select",
});

const patientProps = getV2PatientProps(
  contract as V2ControlledFieldContract<unknown, HTMLInputElement>,
);

<FluriPatientFieldV2
  options={patientOptions}
  value={patientProps.value}
  onValueChange={patientProps.onValueChange}
  onBlur={patientProps.onBlur as React.FocusEventHandler<HTMLInputElement>}
  inputRef={patientProps.inputRef}
  errorMessage={patientProps.errorMessage}
  disabled={patientProps.disabled}
/>;
```

## Anti-Patterns

- Mixing event-based and value-based contracts in one adapter.
- Treating `undefined`, `null`, and `""` as interchangeable without explicit conversion.
- Hiding domain transforms outside Zod codecs.
- Adding root barrel exports for forms v2 modules.
