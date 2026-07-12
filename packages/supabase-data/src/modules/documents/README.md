/\*\*

- Module Architecture README
-
- This documents module follows clean architecture principles with strict layer separation.
  \*/

## Folder Structure

```
modules/documents/
├── domain/                    # Business logic, entities, interfaces
│   ├── dto/                   # Domain DTOs (pure business objects)
│   │   └── patient-document.dto.ts
│   └── ports/                 # Repository interfaces (contracts)
│       └── document-repository.port.ts
├── application/               # Use cases, orchestration
│   └── contracts/             # Request/Response DTOs for boundaries
├── infrastructure/            # External concerns (DB, storage, API)
│   ├── repositories/          # Database implementations
│   │   └── document-supabase.repository.ts
│   └── mappers/               # DB row ↔ Domain DTO conversion
│       └── document.mapper.ts
└── README.md                  # This file
```

## Layer Responsibilities

### Domain Layer (`domain/`)

- **Pure business logic** - no framework dependencies
- **DTOs** - business-facing data structures (readonly, immutable)
- **Ports** - interfaces that infrastructure must implement
- **Zero imports** from infrastructure or presentation layers

**Files:**

- `dto/patient-document.dto.ts` - PatientDocumentDTO, type guards
- `ports/document-repository.port.ts` - DocumentRepository interface

### Application Layer (`application/`)

- **Use case orchestration** - business workflows
- **Request/Response contracts** - boundary DTOs with Zod schemas
- Depends on: domain ports (interfaces), not concrete implementations
- Returns: Result<ResponseDTO, AppError>

**Files:**

- `contracts/` - Zod schemas + Request/Response types for actions

### Infrastructure Layer (`infrastructure/`)

- **External integrations** - database, storage, APIs
- **Repository implementations** - concrete classes implementing domain ports
- **Mappers** - convert DB types to domain DTOs
- **Only layer** that imports `Database` types from `database.types.ts`

**Files:**

- `repositories/document-supabase.repository.ts` - Supabase implementation
- `mappers/document.mapper.ts` - JSON ↔ DTO conversion

## Dependency Direction

```
Presentation (actions, routes)
    ↓ depends on
Application (use cases)
    ↓ depends on
Domain (interfaces, DTOs)
    ↑ implemented by
Infrastructure (repos, mappers)
```

**Key principles:**

1. Domain layer has **zero dependencies** on other layers
2. Application depends on **domain interfaces**, not implementations
3. Infrastructure **implements** domain interfaces
4. Presentation **composes** layers via dependency injection

## Type Isolation

### Where Database Types Are ALLOWED:

- ✅ `infrastructure/repositories/*.repository.ts` - ONLY HERE
- ✅ `infrastructure/mappers/*.mapper.ts` - ONLY HERE

### Where Database Types Are FORBIDDEN:

- ❌ `domain/` - uses DTOs only
- ❌ `application/` - uses DTOs only
- ❌ `actions/` - uses DTOs only
- ❌ `app/` components - uses DTOs only

## Example: Creating a Document

### 1. Domain DTO (what business cares about)

```typescript
export interface PatientDocumentDTO {
  readonly id: string;
  readonly label: string;
  readonly type: string;
  readonly status: "pending" | "complete" | "failed";
  readonly storagePath: string;
  readonly size: string;
  readonly uploadedAt: string;
}
```

### 2. Domain Port (what repository must do)

```typescript
export interface DocumentRepository {
  addDocument(
    patientId: string,
    psychologistId: string,
    document: PatientDocumentDTO,
  ): Promise<Result<PatientDocumentDTO, AppError>>;
}
```

### 3. Infrastructure Repository (how it's done)

```typescript
import type { Database } from "../../../../types/database.types"; // ONLY import here

export class DocumentSupabaseRepository implements DocumentRepository {
  async addDocument(...): Promise<Result<PatientDocumentDTO, AppError>> {
    // Fetch from DB using Database types
    const { data } = await this.supabase
      .from("psychologist_patients")
      .select("attached_documents")
      // ...

    // Convert to domain DTO using mapper
    return ok(document);
  }
}
```

### 4. Infrastructure Mapper (conversion logic)

```typescript
export function fromDatabaseJson(json: Json): readonly PatientDocumentDTO[] {
  // Parse JSONB from DB → domain DTO array
  return json.filter(isValid).map(toDTO);
}

export function toDatabaseJson(docs: readonly PatientDocumentDTO[]): Json {
  // Domain DTO array → JSONB for DB
  return docs.map(fromDTO) as Json;
}
```

### 5. Action (orchestration)

```typescript
export const createPatientDocumentAction = createAction({
  handler: async (input, context) => {
    const { userId, supabase } = context;

    // 1. Create repository instance
    const repo = new DocumentSupabaseRepository(supabase);

    // 2. Upload file to storage
    const uploadResult = await uploadFile(...);

    // 3. Create domain DTO
    const newDoc: PatientDocumentDTO = {
      id: crypto.randomUUID(),
      label: input.name,
      // ...
    };

    // 4. Use repository to persist
    const result = await repo.addDocument(patientId, userId, newDoc);

    // 5. Return result (no mapping needed - already domain DTO)
    return result.map(doc => ({ document: doc }));
  }
});
```

## Benefits

### 1. Type Safety

- Database types contained in infrastructure
- Compile error if domain/app imports Database types
- DTOs are readonly (immutability enforced)

### 2. Testability

- Mock repository interface, not Supabase client
- Test business logic without database
- Fast unit tests

### 3. Maintainability

- Clear responsibilities per layer
- Database schema changes isolated to mappers
- Business logic decoupled from persistence

### 4. Scalability

- Easy to add new repositories (e.g., PostgresRepository, MongoRepository)
- Easy to add new use cases
- Clear boundaries for team collaboration

## Migration Checklist

When migrating existing actions to this architecture:

- [ ] Create domain DTO in `domain/dto/`
- [ ] Create repository port in `domain/ports/`
- [ ] Create mapper in `infrastructure/mappers/`
- [ ] Create repository implementation in `infrastructure/repositories/`
- [ ] Update action to use repository instead of direct Supabase calls
- [ ] Verify no `Database` types leak to action
- [ ] Update tests to mock repository interface
- [ ] Verify type check passes
- [ ] Verify tests pass

## Next Steps

After documents module is complete:

1. Migrate patients module
2. Migrate finances module
3. Add domain validation (value objects)
4. Add domain events (if needed)
5. Add caching layer (repository decorator)

---

**Remember:** The goal is **predictable types at boundaries**, not over-engineering. Start simple, add complexity only when needed.
