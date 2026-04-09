# Zod v4 Migration Guide

**Este projeto usa Zod v4 (`^4.3.6`). NÃO use sintaxe Zod v3!**

## ❌ Padrões Zod v3 (DEPRECIADOS)

### 1. `z.email()`

```typescript
// ❌ Zod v3 - DEPRECIADO
z.email("Invalid email")

// ❌ Também deprecia do:
z.email({ message: "Invalid email" })
```

**Erro:** `'(params?: string | { ... })' is deprecated`

### 2. `z.string().datetime()`

```typescript
// ❌ Zod v3 - DEPRECIADO
z.string().datetime()
z.string().datetime({ offset: true })
z.string().datetime({ precision: 3 })
```

**Erro:** `'(params?: string | { ... })' is deprecated`

### 3. `z.uuid()`

```typescript
// ❌ Zod v3 - DEPRECIADO
z.string().uuid("Invalid UUID")
```

**Erro:** `'(params?: string | { ... })' is deprecated`

### 4. `z.record(z.unknown())`

```typescript
// ❌ Zod v3 - DEPRECIADO (faltam argumentos)
z.record(z.unknown())
```

**Erro:** `Expected 2-3 arguments, but got 1`

---

## ✅ Padrões Zod v4 (CORRETOS)

### 1. Email validation

```typescript
// ✅ Zod v4 - CORRETO
z.email()

// ✅ Com mensagem customizada:
z.email({ message: "Invalid email address" })

// ✅ Ou com .refine():
z.string().refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
  message: "Invalid email address",
})
```

### 2. Datetime validation

```typescript
// ✅ Zod v4 - CORRETO
z.iso.datetime()

// ✅ Com validação customizada:
z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: "Invalid datetime format",
})
```

### 3. UUID validation

```typescript
// ✅ Zod v4 - CORRETO
z.uuid()

// ✅ Com mensagem customizada:
z.uuid({ message: "Invalid UUID format" })

// ✅ Ou com .refine():
z.string().refine(
  (val) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      val
    ),
  {
    message: "Invalid UUID format",
  }
)
```

### 4. Record type

```typescript
// ✅ Zod v4 - CORRETO (2 argumentos obrigatórios)
z.record(z.string(), z.unknown())

// ✅ Ou com tipos específicos:
z.record(z.string(), z.number())
z.record(z.string(), z.object({ name: z.string() }))
```

---

## 📋 Migration Checklist

### Strings

- [ ] `z.email()` → `z.email()`
- [ ] `z.string().datetime()` → `z.iso.datetime()`
- [ ] `z.uuid()` → `z.uuid()`
- [ ] `z.url()` → `z.url()`

### Records

- [ ] `z.record(valueType)` → `z.record(keyType, valueType)`

### Objects

- [ ] `.passthrough()` → behavior changed in v4
- [ ] `.strict()` → behavior changed in v4

### Arrays

- [ ] `.min()`, `.max()`, `.length()` → still work
- [ ] `.nonempty()` → renamed to `.min(1)`

### Numbers

- [ ] `.positive()`, `.negative()`, `.int()` → still work
- [ ] `.min()`, `.max()` → still work

---

## 🔍 Como Identificar Problemas

### TypeScript Errors

```
'(params?: string | { ... })' is deprecated
```

→ Você está usando um método deprecated do Zod v3

```
Expected 2-3 arguments, but got 1
```

→ `z.record()` agora requer 2 argumentos

### Runtime Errors

```
ZodError: [
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": ["email"]
  }
]
```

→ Validação está funcionando, mas schema pode estar errado

---

## 📚 Recursos

- [Zod v4 Release Notes](https://github.com/colinhacks/zod/releases)
- [Zod v4 Documentation](https://zod.dev/)
- [Migration Guide](https://zod.dev/v4)

---

## 🎯 Exemplo Completo

### ❌ Zod v3 (ERRADO)

```typescript
const InsertAssistantInvitesInputSchema = z.object({
  email: z.email("Invalid email"),
  expires_at: z.string().datetime(),
  metadata: z.record(z.unknown()).optional(),
})
```

### ✅ Zod v4 (CORRETO)

```typescript
const InsertAssistantInvitesInputSchema = z.object({
  email: z.email(), // ou .refine() para custom message
  expires_at: z.iso.datetime(), // ou .refine() para custom validation
  metadata: z.record(z.string(), z.unknown()).optional(),
})
```

---

**Regra de Ouro:** Sempre verifique a documentação do Zod v4 antes de usar
métodos de validação!
