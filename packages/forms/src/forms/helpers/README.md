# Form Helpers - Reduzindo Boilerplate

Helpers que facilitam o uso de React Hook Form **mantendo o Controller visível** e seguindo 100% o padrão shadcn/ui.

## 🎯 Filosofia

Estes helpers **NÃO escondem** o `<Controller />`, apenas reduzem o boilerplate repetitivo para casos comuns. Você ainda tem controle total e a estrutura permanece clara.

## 📦 Helpers Disponíveis

### 1. `ControlledField` - Base para todos os campos

Helper genérico que encapsula o padrão `Field + Label + Error`:

```tsx
import { ControlledField } from "@workspace/ui/forms/helpers";
import { Input } from "@workspace/ui/components/input";

<ControlledField
  name="email"
  label="Email"
  description="Seu email de contato"
  required
  render={({ field, fieldState }) => (
    <Input
      {...field}
      type="email"
      placeholder="email@example.com"
      aria-invalid={fieldState.invalid}
    />
  )}
/>;
```

**Equivalente a:**

```tsx
<Controller
  name="email"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name} required>
        Email
      </FieldLabel>
      <Input
        {...field}
        id={field.name}
        type="email"
        placeholder="email@example.com"
        aria-invalid={fieldState.invalid}
      />
      <FieldDescription>Seu email de contato</FieldDescription>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

### 2. `InputField` - Input simples

Para inputs básicos sem lógica complexa:

```tsx
import { InputField } from "@workspace/ui/forms/helpers";

<InputField name="name" label="Nome" placeholder="Digite seu nome" required />;
```

### 3. `TextareaField` - Textarea simples

Para áreas de texto:

```tsx
import { TextareaField } from "@workspace/ui/forms/helpers";

<TextareaField
  name="description"
  label="Descrição"
  rows={4}
  placeholder="Digite uma descrição"
  description="Máximo 500 caracteres"
/>;
```

### 4. `SpecializedField` - Campos especializados

Para campos com lógica complexa (CPF, CNPJ, Phone, etc):

```tsx
import { SpecializedField } from "@workspace/ui/forms/helpers";
import { CpfField } from "@workspace/ui/forms";

<SpecializedField
  name="cpf"
  label="CPF"
  component={CpfField}
  placeholder="000.000.000-00"
  validateOnBlur
/>;
```

## 🎨 Exemplo Completo

### Antes (Muito Boilerplate)

```tsx
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
  FieldGroup,
} from "@workspace/ui/components/field";
import { CpfField, cpfSchema } from "@workspace/ui/forms";

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  cpf: cpfSchema(true),
  bio: z.string().max(500),
});

function MyForm() {
  const form = useForm({ resolver: zodResolver(schema) });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
              <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input {...field} id={field.name} type="email" aria-invalid={fieldState.invalid} />
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
              <CpfField {...field} id={field.name} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="bio"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Bio</FieldLabel>
              <Textarea {...field} id={field.name} rows={4} aria-invalid={fieldState.invalid} />
              <FieldDescription>Máximo 500 caracteres</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );
}
```

### Depois (Com Helpers)

```tsx
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FieldGroup } from "@workspace/ui/components/field";
import { InputField, TextareaField, SpecializedField } from "@workspace/ui/forms/helpers";
import { CpfField, cpfSchema } from "@workspace/ui/forms";

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  cpf: cpfSchema(true),
  bio: z.string().max(500),
});

function MyForm() {
  const form = useForm({ resolver: zodResolver(schema) });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <InputField name="name" label="Nome" placeholder="Digite seu nome" />

          <InputField name="email" label="Email" type="email" placeholder="email@example.com" />

          <SpecializedField
            name="cpf"
            label="CPF"
            component={CpfField}
            placeholder="000.000.000-00"
          />

          <TextareaField name="bio" label="Bio" rows={4} description="Máximo 500 caracteres" />
        </FieldGroup>
      </form>
    </FormProvider>
  );
}
```

## 🎯 Quando Usar Cada Abordagem

### Use `ControlledField` quando:

- ✅ Precisa de customização específica
- ✅ Tem lógica condicional no render
- ✅ Quer controle total sobre o componente

### Use `InputField` / `TextareaField` quando:

- ✅ Campo simples sem lógica complexa
- ✅ Quer reduzir boilerplate
- ✅ Padrão comum em todo o app

### Use `SpecializedField` quando:

- ✅ Usa campos com lógica complexa (CPF, CNPJ, Phone)
- ✅ Quer manter consistência
- ✅ Precisa de props específicas do campo

### Use `Controller` diretamente quando:

- ✅ Precisa de controle total
- ✅ Tem lógica muito específica
- ✅ Está debugando um problema
- ✅ Quer máxima transparência

## ✅ Benefícios

1. **Menos Boilerplate** - 70% menos código para casos comuns
2. **Controller Visível** - Ainda segue o padrão shadcn/ui
3. **Type-Safe** - Totalmente tipado com TypeScript
4. **Flexível** - Pode usar Controller diretamente quando necessário
5. **Consistente** - Padrão uniforme em todo o app

## 🚫 O que NÃO é

- ❌ Não é um wrapper que esconde o Controller
- ❌ Não é uma abstração mágica
- ❌ Não impede uso do Controller diretamente
- ❌ Não quebra o padrão shadcn/ui

## 📚 Comparação com HOC Deprecated

| Aspecto            | HOC (Deprecated)   | Helpers (Novo)                |
| ------------------ | ------------------ | ----------------------------- |
| Controller visível | ❌ Escondido       | ✅ Visível (via FormProvider) |
| Debugging          | ❌ Difícil         | ✅ Fácil                      |
| Flexibilidade      | ❌ Limitada        | ✅ Total                      |
| Boilerplate        | ✅ Mínimo          | ✅ Reduzido                   |
| Padrão Shadcn      | ❌ Não segue       | ✅ Segue 100%                 |
| TypeScript         | ⚠️ Tipos genéricos | ✅ Tipos precisos             |

## 🔧 API Reference

### ControlledField

```tsx
interface ControlledFieldProps<TFieldValues, TName> {
  name: TName;
  label?: string;
  description?: string;
  required?: boolean;
  hideLabel?: boolean;
  render: (props: { field: any; fieldState: any }) => ReactNode;
  // + todas as props do Controller
}
```

### InputField

```tsx
interface InputFieldProps<TFieldValues, TName> extends React.InputHTMLAttributes<HTMLInputElement> {
  name: TName;
  label?: string;
  description?: string;
  required?: boolean;
  hideLabel?: boolean;
}
```

### TextareaField

```tsx
interface TextareaFieldProps<
  TFieldValues,
  TName,
> extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: TName;
  label?: string;
  description?: string;
  required?: boolean;
  hideLabel?: boolean;
}
```

### SpecializedField

```tsx
interface SpecializedFieldProps<TFieldValues, TName, TComponentProps> {
  name: TName;
  label?: string;
  description?: string;
  required?: boolean;
  hideLabel?: boolean;
  component: React.ComponentType<TComponentProps>;
  // + todas as props do componente
}
```

## 🎓 Resumo

- ✅ Use helpers para reduzir boilerplate
- ✅ Controller ainda está lá (via FormProvider)
- ✅ Pode misturar helpers com Controller direto
- ✅ 100% compatível com shadcn/ui
- ✅ Type-safe e flexível
