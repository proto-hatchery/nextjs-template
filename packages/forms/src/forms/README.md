# Formulários Fluri UI

Sistema completo de formulários para aplicações Fluri, com suporte a React Hook Form e validação com Zod.

## ⚠️ AVISO IMPORTANTE

**Os componentes `*HookForm` (ex: `TextFieldHookForm`, `CPFFieldHookForm`) estão DEPRECATED.**

### ✅ Opções Recomendadas:

1. **Helpers (Menos Boilerplate)** - Para casos comuns
   - 📖 [Guia de Helpers](./helpers/README.md)
   - `InputField`, `TextareaField`, `SpecializedField`

2. **Controller Direto (Máximo Controle)** - Para casos complexos
   - 📖 [Guia de Padrões React Hook Form](.cursor/rules/react-hook-form-patterns.mdc)
   - 🔗 [Shadcn/UI React Hook Form Guide](https://ui.shadcn.com/docs/forms/react-hook-form)

3. **Deprecation Notice** - Guia de migração
   - 📋 [Aviso de Deprecação](./DEPRECATION_NOTICE.md)

## 📦 Instalação

Os formulários já estão incluídos no pacote `@workspace/ui`. As dependências necessárias são:

- `react-hook-form` - Gerenciamento de formulários
- `@hookform/resolvers` - Resolvers para validação
- `zod` - Validação de schemas
- `date-fns` - Manipulação de datas
- `input-otp` - Campos OTP
- `use-mask-input` - Máscaras de input
- `libphonenumber-js` - Validação de telefones
- `react-phone-number-input` - Input de telefone
- `@internationalized/date` - Datas internacionalizadas
- `react-day-picker` - Seletor de datas
- `countries-list` - Lista de países
- `react-circle-flags` - Bandeiras de países

## 🎯 Uso

### Importação

```typescript
// Importar campos base (standalone)
import { TextField, TextAreaField, SelectField } from "@workspace/ui/forms";

// Importar campos com React Hook Form
import { TextFieldHookForm, SelectFieldHookForm } from "@workspace/ui/forms";

// Importar campos customizados
import { CpfField, CnpjField, PhoneField, CurrencyField } from "@workspace/ui/forms";

// Importar utilitários
import { formatCpf, isValidCpf, cpfSchema } from "@workspace/ui/forms";
```

## 📝 Campos Disponíveis

### Campos Base (Standalone)

Campos fundamentais que podem ser usados sem React Hook Form:

- `TextField` - Campo de texto simples
- `TextAreaField` - Área de texto
- `SelectField` - Seletor dropdown
- `CheckboxField` - Checkbox
- `RadioField` - Radio button
- `SwitchField` - Switch toggle
- `DatePicker` - Seletor de data
- `SearchField` - Campo de busca

### Campos Especializados (Standalone)

Campos com validação e formatação específicas:

- `CpfField` - CPF brasileiro
- `CnpjField` - CNPJ brasileiro
- `RgField` - RG brasileiro
- `PhoneField` - Telefone internacional
- `ZipCodeField` - CEP brasileiro
- `CrpField` - CRP (Conselho Regional de Psicologia)
- `CurrencyField` - Valores monetários
- `BirthdateField` - Data de nascimento
- `PasswordField` - Senha com toggle de visibilidade
- `OTPField` - One-Time Password
- `InstagramUsernameField` - Username do Instagram
- `SelectWithSearch` - Select com busca
- `TagMultiSelect` - Seleção múltipla de tags

### Campos com React Hook Form

Todos os campos acima têm versões integradas com React Hook Form, com sufixo `HookForm`:

```typescript
import {
  TextFieldHookForm,
  CPFFieldHookForm,
  PhoneInputHookForm,
  // ... etc
} from "@workspace/ui/forms";
```

Campos adicionais exclusivos para Hook Form:

- `CheckboxGroupFieldHookForm` - Grupo de checkboxes
- `RadioCardsFieldHookForm` - Radio buttons em formato de cards
- `FileUploadFieldHookForm` - Upload de arquivos

## 🔧 Exemplos de Uso

### Campo Simples (Standalone)

```tsx
import { TextField } from "@workspace/ui/forms";

function MyForm() {
  const [value, setValue] = useState("");

  return (
    <TextField
      label="Nome"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Digite seu nome"
      required
    />
  );
}
```

### Com React Hook Form - Opção 1: Helpers (Recomendado para casos comuns)

**✅ Menos boilerplate, Controller ainda visível via FormProvider**

```tsx
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FieldGroup } from "@workspace/ui/components/field";
import { InputField, SpecializedField } from "@workspace/ui/forms/helpers";
import { CpfField, cpfSchema } from "@workspace/ui/forms";

const schema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cpf: cpfSchema(true),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", cpf: "" },
  });

  function onSubmit(data: FormData) {
    console.log(data);
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <InputField name="name" label="Nome" placeholder="Digite seu nome" />

          <SpecializedField
            name="cpf"
            label="CPF"
            component={CpfField}
            placeholder="000.000.000-00"
          />
        </FieldGroup>

        <BrandButton type="submit" isLoading={form.formState.isSubmitting}>
          Enviar
        </BrandButton>
      </form>
    </FormProvider>
  );
}
```

**📚 Veja mais:** [Guia de Helpers](./helpers/README.md)

### Com React Hook Form - Opção 2: Controller Direto (Máximo controle)

```tsx
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@workspace/ui/components/input";
import { Field, FieldLabel, FieldError, FieldGroup } from "@workspace/ui/components/field";
import { CpfField, cpfSchema } from "@workspace/ui/forms";

const schema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cpf: cpfSchema(true),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", cpf: "" },
  });

  function onSubmit(data: FormData) {
    console.log(data);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Digite seu nome"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="cpf"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>CPF</FieldLabel>
              <CpfField
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="000.000.000-00"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <BrandButton type="submit" isLoading={form.formState.isSubmitting}>
        Enviar
      </BrandButton>
    </form>
  );
}
```

**📚 Referências:**

- [Shadcn/UI React Hook Form Guide](https://ui.shadcn.com/docs/forms/react-hook-form)
- [Padrões de React Hook Form](.cursor/rules/react-hook-form-patterns.mdc)

### Criando Seus Próprios Campos Hook Form

Você pode usar o HOC `withHookForm` para criar versões Hook Form de qualquer componente:

```tsx
import { withHookForm } from "@workspace/ui/forms";
import { MyCustomField } from "./my-custom-field";

export const MyCustomFieldHookForm = withHookForm(MyCustomField);
```

## 🔍 Validação

### Schemas Zod Prontos

O pacote exporta schemas Zod prontos para uso:

```typescript
import {
  cpfSchema,
  cnpjSchema,
  birthdateSchema,
  birthdateWithMinAgeSchema,
} from "@workspace/ui/forms";

const schema = z.object({
  cpf: cpfSchema(true), // CPF obrigatório
  cnpj: cnpjSchema(false), // CNPJ opcional
  birthdate: birthdateWithMinAgeSchema(18), // Idade mínima de 18 anos
});
```

### Validação Customizada

```typescript
import { isValidCpf, isValidCnpj } from "@workspace/ui/forms";

const schema = z.object({
  cpf: z.string().refine((val) => isValidCpf(val), "CPF inválido"),
  cnpj: z.string().refine((val) => isValidCnpj(val), "CNPJ inválido"),
});
```

## 🎨 Customização

Todos os campos suportam customização via props:

```tsx
<TextFieldHookForm
  name="email"
  label="E-mail"
  size="lg" // sm | md | lg
  variant="ghost" // default | ghost
  helperText="Digite um e-mail válido"
  containerClassName="mb-4"
  labelClassName="font-bold"
  startIcon={<MailIcon />}
  endIcon={<CheckIcon />}
  disabled={false}
  required={true}
/>
```

## 🛠️ Utilitários

### Formatação

```typescript
import {
  formatCpf,
  formatCnpj,
  formatCurrency,
  formatZipCode,
  formatBirthdate,
} from "@workspace/ui/forms";

const formatted = formatCpf("12345678900"); // "123.456.789-00"
```

### Validação

```typescript
import { isValidCpf, isValidCnpj, isValidRg, isValidZipCode } from "@workspace/ui/forms";

const isValid = isValidCpf("123.456.789-00"); // true ou false
```

### Helpers do React Hook Form

```typescript
import { focusFirstInvalidField, getByProperty } from "@workspace/ui/forms";

// Foca no primeiro campo inválido
focusFirstInvalidField(errors);

// Pega erro de campo aninhado
const error = getByProperty("user.address.street", errors);
```

## 📁 Estrutura do Projeto

```
forms/
├── components/              # Componentes de campo
│   ├── base/               # Campos fundamentais
│   └── specialized/        # Campos especializados
├── adapters/               # Adaptadores React Hook Form
│   └── with-hook-form.tsx # HOC para criar versões Hook Form
├── utils/                  # Utilitários
│   ├── formatting.ts      # Formatação (CPF, CNPJ, etc)
│   ├── validation.ts      # Validação (CPF, CNPJ, etc)
│   └── form-helpers.ts    # Helpers do React Hook Form
├── types/                  # Tipos compartilhados
│   └── index.ts
└── index.ts               # Exports públicos
```

## 🌍 Internacionalização

Os campos de telefone e data suportam internacionalização:

```tsx
<PhoneInputHookForm
  name="phone"
  defaultCountry="US" // Código do país
  international // Formato internacional
/>
```

## 🚀 Migração da Estrutura Antiga

Se você estava usando a estrutura antiga (`fields/` e `hook-form/`), os imports continuam funcionando, mas recomendamos migrar para os novos:

**Antes:**

```typescript
import { TextField } from "@workspace/ui/forms/fields/base/text-field/component";
import { CPFFieldHookForm } from "@workspace/ui/forms/hook-form/cpf-field";
```

**Depois:**

```typescript
import { TextField, CPFFieldHookForm } from "@workspace/ui/forms";
```

## 🤝 Contribuindo

Ao adicionar novos campos:

1. Crie o campo em `components/specialized/` ou `components/base/`
2. Adicione tipos em `types/index.ts` se necessário
3. Adicione utils em `utils/` se necessário
4. Exporte no `index.ts` principal
5. Crie a versão Hook Form usando `createHookFormField`
6. Adicione testes se aplicável
7. Atualize esta documentação

## 📚 Recursos Adicionais

- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [Shadcn/ui Docs](https://ui.shadcn.com/)
