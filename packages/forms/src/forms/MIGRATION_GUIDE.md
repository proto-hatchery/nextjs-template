# Guia de Migração - Nova Estrutura de Formulários

## 📋 Resumo das Mudanças

A estrutura dos formulários foi completamente reorganizada para melhor manutenibilidade e DX (Developer Experience).

### Estrutura Antiga ❌

```
forms/
├── fields/
│   ├── base/
│   │   └── [campo]/
│   │       ├── component.tsx
│   │       └── index.ts
│   └── custom/
│       └── [campo]/
│           ├── component.tsx
│           ├── index.ts
│           ├── utils.ts
│           └── validation.ts
└── hook-form/
    └── [campo]/
        ├── component.tsx
        └── index.ts
```

### Estrutura Nova ✅

```
forms/
├── components/
│   ├── base/              # Campos fundamentais (9 arquivos)
│   │   ├── text-field.tsx
│   │   ├── select-field.tsx
│   │   └── ...
│   └── specialized/       # Campos especializados (16 arquivos)
│       ├── cpf-field.tsx
│       ├── phone-input.tsx
│       └── ...
├── adapters/
│   └── with-hook-form.tsx # HOC único para React Hook Form
├── utils/
│   ├── formatting.ts      # Todas as funções de formatação
│   ├── validation.ts      # Todas as funções de validação
│   └── form-helpers.ts    # Helpers do React Hook Form
├── types/
│   └── index.ts          # Tipos compartilhados
└── index.ts              # Exports públicos
```

## 🚀 Benefícios

1. **~60% menos arquivos**: De ~150 arquivos para ~60 arquivos
2. **Utils consolidados**: Todas as funções de formatação e validação em um só lugar
3. **HOC único**: Um adaptador genérico ao invés de 25+ wrappers
4. **Imports mais simples**: Tudo exportado do index principal
5. **Melhor DX**: Mais fácil de encontrar e modificar componentes

## 📦 Como Migrar

### Imports Básicos

**Antes:**

```typescript
import { TextField } from "@workspace/ui/forms/fields/base/text-field/component";
import { CPFFieldHookForm } from "@workspace/ui/forms/hook-form/cpf-field";
import { formatCpf } from "@workspace/ui/forms/fields/custom/cpf-field/utils";
```

**Depois:**

```typescript
import { TextField, CPFFieldHookForm, formatCpf } from "@workspace/ui/forms";
```

### Criando Campos Hook Form Customizados

**Antes:**

```typescript
// Precisava criar um arquivo wrapper completo
import { Controller, useFormContext } from "react-hook-form";
import { MyField } from "./my-field";

export const MyFieldHookForm = ({ name, ...props }) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => <MyField {...props} {...field} />}
    />
  );
};
```

**Depois:**

```typescript
import { withHookForm } from "@workspace/ui/forms";
import { MyField } from "./my-field";

export const MyFieldHookForm = withHookForm(MyField);
```

### Validação com Zod

**Antes:**

```typescript
import { z } from "zod";
import { isValidCpf } from "@workspace/ui/forms/fields/custom/cpf-field/utils";

const schema = z.object({
  cpf: z.string().refine((val) => isValidCpf(val), "CPF inválido"),
});
```

**Depois:**

```typescript
import { cpfSchema } from "@workspace/ui/forms";

const schema = z.object({
  cpf: cpfSchema(true), // true = obrigatório
});
```

## ⚠️ Breaking Changes

### 1. Campos Complexos Sem Wrapper Automático

Os seguintes campos ainda não têm versões Hook Form geradas automaticamente:

- `SelectFieldHookForm`
- `RadioFieldHookForm`
- `SelectWithSearchHookForm`
- `TagMultiSelectHookForm`

**Solução temporária**: Use o `withHookForm` manualmente ou aguarde implementação.

### 2. Imports de Tipos

Alguns tipos agora são exportados do `/types`:

```typescript
// Antes
import type { PhoneFieldProps } from "@workspace/ui/forms/fields/custom/phone-input/types";

// Depois
import type { PhoneFieldProps } from "@workspace/ui/forms";
```

### 3. Funções de Validação

Funções de validação foram movidas para `utils/validation.ts`:

```typescript
// Antes
import { isValidCpf } from "@workspace/ui/forms/fields/custom/cpf-field/utils";

// Depois
import { isValidCpf } from "@workspace/ui/forms";
```

## 🔧 Ferramentas Disponíveis

### HOC `withHookForm`

Transforma qualquer campo em uma versão Hook Form:

```typescript
import { withHookForm } from "@workspace/ui/forms";

const MyFieldHookForm = withHookForm(MyField);
```

### Função `createHookFormField`

Cria uma versão Hook Form com nome personalizado:

```typescript
import { createHookFormField } from "@workspace/ui/forms";

const MyFieldHookForm = createHookFormField(MyField, "MyFieldHookForm");
```

## 📚 Recursos

- [README.md](./README.md) - Documentação completa
- [Exemplos de uso](./README.md#-exemplos-de-uso)
- [Validação com Zod](./README.md#-validação)

## 🐛 Problemas Conhecidos

1. **Campos complexos**: SelectField, RadioField, SelectWithSearch e TagMultiSelect ainda precisam de wrappers customizados
2. **Backwards compatibility**: Imports antigos não funcionam mais (breaking change intencional)

## 🤝 Contribuindo

Ao adicionar novos campos:

1. Adicione o componente em `components/base/` ou `components/specialized/`
2. Adicione utils em `utils/` se necessário
3. Adicione tipos em `types/` se necessário
4. Exporte no `index.ts` principal
5. Crie a versão Hook Form usando `createHookFormField`
6. Atualize o README.md

## ✅ Checklist de Migração

- [ ] Atualizar imports para usar `@workspace/ui/forms` diretamente
- [ ] Substituir validações customizadas por schemas Zod prontos
- [ ] Testar campos Hook Form em formulários existentes
- [ ] Verificar se não há erros de TypeScript
- [ ] Atualizar documentação do projeto se necessário
