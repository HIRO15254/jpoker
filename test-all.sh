#!/bin/bash

# すべてのテストファイルを実行するスクリプト
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

echo "Running all test files individually..."

echo "1. Page tests:"
bun test src/app/__tests__/page.test.tsx

echo "2. Connection tests:"
bun test src/lib/db/__tests__/connection.test.ts

echo "3. Schema tests:"
bun test src/lib/db/__tests__/schema.test.ts

echo "4. CRUD Simple tests:"
bun test src/lib/db/__tests__/crud-simple.test.ts

echo "5. CRUD Mock tests:"
bun test src/lib/db/__tests__/crud-mock.test.ts

echo "6. CRUD tests:"
bun test src/lib/db/__tests__/crud.test.ts

echo "7. Repository tests:"
bun test src/lib/db/__tests__/repositories.test.ts

echo "8. Integration tests:"
bun test src/lib/db/__tests__/integration/database.test.ts

echo "All tests completed!"