# ⚠️ DEPRECATION NOTICE - Hook Form HOC Pattern

## 🚨 Status: DEPRECATED

O padrão de HOC (`withHookForm`, `createHookFormField`) e os componentes `*HookForm` gerados automaticamente estão **DEPRECATED** e serão removidos em uma versão futura.

## ❌ O que está sendo deprecado?

### 1. HOC Pattern

```tsx
// ❌ DEPRECATED
import { withHookForm } from "@workspace/ui/forms";
const TextFieldHookForm = withHookForm(TextField);
```

### 2. Componentes \*HookForm pré-criados

```tsx
// ❌ DEPRECATED
import { TextFieldHookForm, CPFFieldHookForm } from "@workspace/ui/forms";

<TextFieldHookForm name="title" label="Title" />
<CPFFieldHookForm name="cpf" label="CPF" />
```

## ✅ O que usar no lugar?

### Padrão Recomendado: Controller Pattern

Use o `<Controller />` diretamente do React Hook Form, seguindo o padrão shadcn/ui:

```tsx
import { Controller, useForm } from "react-hook-form";
import { TextField, CpfField } from "@workspace/ui/forms";
import { Field, FieldLabel, FieldError } from "@workspace/ui/components/field";

// No seu formulário:
<Controller
  name="title"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Title</FieldLabel>
      <TextField {...field} id={field.name} aria-invalid={fieldState.invalid} />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>;
```

## 📋 Guia de Migração

### Antes (HOC Pattern)

```tsx
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TextFieldHookForm, CPFFieldHookForm } from "@workspace/ui/forms";

const schema = z.object({
  name: z.string().min(3),
  cpf: z.string().min(11),
});

function MyForm() {
  const methods = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <TextFieldHookForm name="name" label="Nome" placeholder="Digite seu nome" />

        <CPFFieldHookForm name="cpf" label="CPF" placeholder="000.000.000-00" />

        <BrandButton type="submit" isLoading={methods.formState.isSubmitting}>
          Enviar
        </BrandButton>
      </form>
    </FormProvider>
  );
}
```

### Depois (Controller Pattern)

```tsx
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@workspace/ui/components/input";
import { Field, FieldLabel, FieldError, FieldGroup } from "@workspace/ui/components/field";
import { CpfField } from "@workspace/ui/forms";

const schema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cpf: z.string().min(11, "CPF inválido"),
});

type FormData = z.infer<typeof schema>;

function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      cpf: "",
    },
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

## 🎯 Benefícios da Migração

### 1. **Melhor Debugging**

- Estrutura do formulário visível no código
- Fácil identificar problemas de validação
- Stack traces mais claros

### 2. **Melhor Acessibilidade**

- `aria-invalid` sincronizado com `fieldState.invalid`
- Associação correta entre label e input via `htmlFor`
- Melhor suporte a screen readers

### 3. **Mais Flexibilidade**

- Controle total sobre a renderização
- Fácil adicionar lógica customizada
- Melhor suporte a layouts complexos

### 4. **Compatibilidade com Shadcn/UI**

- Segue o padrão oficial do shadcn/ui
- Melhor integração com componentes shadcn
- Exemplos e documentação alinhados

### 5. **TypeScript Melhorado**

- Tipos mais precisos
- Melhor autocomplete
- Menos `any` e type assertions

## 📅 Timeline de Deprecação

- **Agora**: HOC pattern marcado como deprecated
- **v2.0.0**: Avisos de deprecação no console
- **v3.0.0**: Remoção completa do HOC pattern

## 🆘 Suporte

Se você tiver dúvidas sobre a migração:

1. Consulte o [React Hook Form Patterns Guide](.cursor/rules/react-hook-form-patterns.mdc)
2. Veja exemplos no [README.md](./README.md)
3. Consulte a [documentação oficial do shadcn/ui](https://ui.shadcn.com/docs/forms/react-hook-form)

## 🔧 Componentes Base Continuam Disponíveis

Os componentes base (sem HOC) continuam totalmente suportados:

```tsx
import {
  TextField,
  CpfField,
  CnpjField,
  PhoneField,
  // ... todos os campos base
} from "@workspace/ui/forms";
```

Use-os com `<Controller />` para integração com React Hook Form.

## ✅ Checklist de Migração

Para cada formulário que usa o padrão HOC:

- [ ] Remover `FormProvider` (não é mais necessário)
- [ ] Substituir `*HookForm` por `<Controller />` + campo base
- [ ] Adicionar `<Field />` wrapper com `data-invalid={fieldState.invalid}`
- [ ] Adicionar `<FieldLabel />` com `htmlFor={field.name}`
- [ ] Adicionar `aria-invalid={fieldState.invalid}` no input
- [ ] Substituir `<FieldError>{errorMessage}</FieldError>` por `<FieldError errors={[fieldState.error]} />`
- [ ] Testar validação e acessibilidade
- [ ] Remover imports de `*HookForm`

## 📖 Recursos Adicionais

- [Shadcn/UI React Hook Form Guide](https://ui.shadcn.com/docs/forms/react-hook-form)
- [Shadcn/UI Field Component](https://ui.shadcn.com/docs/components/field)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
