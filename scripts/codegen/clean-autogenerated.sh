#!/bin/bash
# Clean ONLY auto-generated files (by naming convention)
# NEVER deletes manual files or configs
#
# NAMING CONVENTION:
# - Auto-generated: *.codegen.ts, *.codegen.test.ts, *.codegen.test.tsx
# - Manual: *.ts (no .codegen. in name)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🧹 Cleaning auto-generated files..."
echo ""

echo "📋 Files PRESERVED (never deleted):"
echo -e "${GREEN}  ✓${NC} config/*.json"
echo -e "${GREEN}  ✓${NC} packages/supabase-infra/src/types/database.types.ts"
echo -e "${GREEN}  ✓${NC} Manual actions (_shared/, user-access/, user-roles/, profiles/, example/)"
echo -e "${GREEN}  ✓${NC} Manual tests (tests/unit/codegen/, tests/integration/supabase-auth/)"
echo -e "${GREEN}  ✓${NC} Files WITHOUT .codegen. in filename"
echo ""

# Clean modules (ONLY *.codegen.ts)
echo "🗑️  Cleaning auto-generated modules..."
MODULES_COUNT=$(find packages/supabase-data/src/modules -type f -name "*.codegen.ts" 2>/dev/null | wc -l)
find packages/supabase-data/src/modules -type f -name "*.codegen.ts" -delete 2>/dev/null || true
echo -e "${GREEN}  ✓${NC} Cleaned $MODULES_COUNT module files"
echo ""

# Clean hooks (ONLY *.codegen.ts)
echo "🗑️  Cleaning auto-generated hooks..."
HOOKS_COUNT=$(find packages/supabase-data/src/hooks -mindepth 2 -type f -name "*.codegen.ts" 2>/dev/null | wc -l)
find packages/supabase-data/src/hooks -mindepth 2 -type f -name "*.codegen.ts" -delete 2>/dev/null || true
echo -e "${GREEN}  ✓${NC} Cleaned $HOOKS_COUNT hook files"
echo ""

# Clean actions (ONLY *.codegen.ts, excluding manual dirs)
echo "🗑️  Cleaning auto-generated actions..."
ACTIONS_COUNT=$(find packages/supabase-data/src/actions -mindepth 2 -type f -name "*.codegen.ts" \
  ! -path "*/_shared/*" \
  ! -path "*/user-access/*" \
  ! -path "*/user-roles/*" \
  ! -path "*/profiles/*" \
  ! -path "*/example/*" \
  2>/dev/null | wc -l)
find packages/supabase-data/src/actions -mindepth 2 -type f -name "*.codegen.ts" \
  ! -path "*/_shared/*" \
  ! -path "*/user-access/*" \
  ! -path "*/user-roles/*" \
  ! -path "*/profiles/*" \
  ! -path "*/example/*" \
  -delete 2>/dev/null || true
echo -e "${GREEN}  ✓${NC} Cleaned $ACTIONS_COUNT action files"
echo ""

# Clean integration tests (ALL *.codegen.*.test.ts files)
echo "🗑️  Cleaning auto-generated integration tests..."
TESTS_COUNT=$(find tests/integration/supabase-data/modules -type f \( -name "*.codegen.test.ts" -o -name "*.codegen.*.test.ts" \) 2>/dev/null | wc -l)
find tests/integration/supabase-data/modules -type f \( -name "*.codegen.test.ts" -o -name "*.codegen.*.test.ts" \) -delete 2>/dev/null || true
echo -e "${GREEN}  ✓${NC} Cleaned $TESTS_COUNT integration test files"
echo ""

# Clean unit tests (ALL *.codegen.test.ts and *.codegen.*.test.ts files)
echo "🗑️  Cleaning auto-generated unit tests..."
UNIT_TESTS_COUNT=$(find tests/unit/supabase-data -type f \( -name "*.codegen.test.ts" -o -name "*.codegen.*.test.ts" \) 2>/dev/null | wc -l)
find tests/unit/supabase-data -type f \( -name "*.codegen.test.ts" -o -name "*.codegen.*.test.ts" \) -delete 2>/dev/null || true
echo -e "${GREEN}  ✓${NC} Cleaned $UNIT_TESTS_COUNT unit test files"
echo -e "${YELLOW}  Note: Manual tests are PRESERVED${NC}"
echo ""

# Prune empty domain folders left after *.codegen.ts deletion (safe: only dirs with zero entries)
echo "🗑️  Pruning empty domain directories under actions/hooks/tests..."
PRUNE_BASES=(
  "packages/supabase-data/src/actions"
  "packages/supabase-data/src/hooks"
  "tests/unit/supabase-data/actions"
  "tests/unit/supabase-data/hooks"
  "tests/integration/supabase-data/modules"
)
PRUNED=0
for base in "${PRUNE_BASES[@]}"; do
  if [ -d "$base" ]; then
    COUNT=$(find "$base" -mindepth 1 -depth -type d -empty 2>/dev/null | wc -l | tr -d "[:space:]")
    find "$base" -mindepth 1 -depth -type d -empty -delete 2>/dev/null || true
    PRUNED=$((PRUNED + COUNT))
  fi
done
echo -e "${GREEN}  ✓${NC} Removed $PRUNED empty director(y/ies) (template dirs with files unchanged)"
echo ""

echo "📊 Final state:"
echo "   Actions: $(find packages/supabase-data/src/actions -type f -name '*.ts' | wc -l | xargs)"
echo "   Modules: $(find packages/supabase-data/src/modules -type f -name '*.ts' 2>/dev/null | wc -l | xargs)"
echo "   Hooks: $(find packages/supabase-data/src/hooks -type f -name '*.ts' 2>/dev/null | wc -l | xargs)"
echo ""

echo "Manual files preserved:"
find packages/supabase-data/src/actions -type f -name "*.ts" | while read file; do
  echo -e "${GREEN}  ✓${NC} $file"
done
echo ""

echo -e "${GREEN}✅ Clean complete!${NC}"
