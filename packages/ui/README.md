# `@workspace/ui` — **NÃO EDITES ISTO À MÃO**

Este directório é o pacote **shadcn/ui** do monorepo. Trata-o como **gerado e
imutável** para código de produto.

## Regra única (memoriza)

| Permitido                                                                          | Proibido                                                                         |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Adicionar/atualizar componentes **só** com o CLI do shadcn                         | Abrir `src/components/*.tsx` e “ajustar” para uma feature                        |
| `pnpm dlx shadcn@latest add <componente> --cwd packages/ui` (ou equivalente)       | Criar aqui componentes de negócio, formulários de domínio ou wrappers de produto |
| Corrigir problemas **subindo** alterações via registry/CLI ou reportando ao shadcn | Copiar um componente para cá e editar à mão para “ser mais rápido”               |

Se precisas de UI partilhada **escrita** por humanos (composições, marca, blocos
reutilizáveis entre apps), isso vai para **`@workspace/brand`**
(`packages/brand`), **não** para aqui.

## Porquê

- **Upgrades** do shadcn sem conflitos com código de produto misturado
- **Um só sítio** para primitivos; a equipa sabe sempre onde procurar
- **Menos regressões** visuais por edições “pontuais”

## Testes

**Não** mantemos testes unitários neste pacote: os primitivos vêm do shadcn e
são cobertos pelo upstream e pelos maintainers. Retestar aqui duplica esforço e
quebra facilmente quando corres `shadcn add … --overwrite`. Testa composições e
marca em **`@workspace/brand`** e fluxos nas apps (e2e se fizer sentido).

## Documentação relacionada

- [AGENTS.md](./AGENTS.md) — regras detalhadas (inglês)
- [packages/brand/README.md](../brand/README.md) — UI de produto partilhada

## Comandos úteis

```bash
pnpm --filter @workspace/ui lint
pnpm --filter @workspace/ui typecheck
pnpm dlx shadcn@latest add button --cwd packages/ui
```

**Se estás a ler isto antes de implementar uma feature:** confirma que não estás
a editar `packages/ui` para a “resolver”. Usa `packages/brand` ou componentes da
app.
