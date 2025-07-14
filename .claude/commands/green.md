---
description: "TDDのGREENプロセス - テストを通す最小限の実装を作成"
allowed-tools: ["Bash", "Write", "Read", "LS", "Glob", "Grep", "Edit", "MultiEdit"]
---

# /green - TDD GREENプロセス実行コマンド

## ステップ1: 現在の状況確認

現在の失敗テストを確認し、実装すべき内容を把握します。

### 1.1 最新仕様ファイルの確認
!latest_spec=$(ls -t specs/*.md 2>/dev/null | head -1)
!if [ -z "$latest_spec" ]; then echo "❌ エラー: 仕様ファイルが見つかりません。"; exit 1; fi
!echo "📋 仕様ファイル: $latest_spec"

### 1.2 現在のテスト状況を確認
!echo "🔴 現在のテスト状況を確認..."
!bun run test 2>&1 | head -20

## ステップ2: 失敗テストの詳細分析

失敗しているテストの詳細を分析し、実装すべき機能を特定します。

### 2.1 失敗テストファイルの特定
!echo "📝 失敗しているテストファイルを特定..."
!failed_tests=$(bun run test 2>&1 | grep -E "FAIL.*\.test\.(ts|tsx)" | head -5)
!echo "$failed_tests"

### 2.2 仕様書の再確認
!echo "📖 仕様書の詳細:"
!cat "$latest_spec"

## ステップ3: 基本実装ファイルの作成

Container/Presentationパターンに従って基本実装を作成します。

**注意: 以下のテンプレートを仕様に合わせて調整してください**

### 3.1 型定義の作成（必要に応じて）

```typescript
// src/types/[FeatureName].d.ts (必要な場合)
export interface [FeatureName]Props {
  // 仕様に基づくプロパティ定義
}
```

### 3.2 Presentationコンポーネントの基本実装

**テンプレート例:**

```typescript
// src/app/[path]/[ComponentName]Presentation.tsx
'use client';

import { Card, Text, Button, Group } from '@mantine/core';

interface [ComponentName]PresentationProps {
  // テストから推定される必要なプロパティ
  // 仕様書を参考に調整してください
}

export function [ComponentName]Presentation(props: [ComponentName]PresentationProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      {/* 
        テストが期待する最小限の実装:
        - テストで確認されている要素を含む
        - 仕様書で定義された表示内容
        - 必要な属性・テストID等
      */}
      <Text>実装予定: {JSON.stringify(props)}</Text>
    </Card>
  );
}
```

### 3.3 Containerコンポーネントの基本実装（Server Component）

```typescript
// src/app/[path]/[ComponentName]Container.tsx
import 'server-only';
import { [ComponentName]Presentation } from './[ComponentName]Presentation';

// Drizzle ORMを使用したデータフェッチ（必要に応じて）
// import { db } from '@/lib/db/connection';
// import { [tableName] } from '@/lib/db/schema';

export async function [ComponentName]Container() {
  // 仕様に基づくデータフェッチ
  // const data = await db.select().from([tableName]);
  
  // テストを通すための最小限のプロパティ
  const mockData = {
    // テストで期待されているプロパティ
  };

  return <[ComponentName]Presentation {...mockData} />;
}
```

### 3.4 indexファイルの作成

```typescript
// src/app/[path]/index.ts
export { [ComponentName]Container as default } from './[ComponentName]Container';
export { [ComponentName]Presentation } from './[ComponentName]Presentation';
```

## ステップ4: フォーム実装（該当する場合）

フォームが必要な場合の基本実装テンプレート:

### 4.1 Zodスキーマの実装

```typescript
// src/app/[path]/forms/[FormName]/[formName]Schema.ts
import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
// import { [tableName] } from '@/lib/db/schema/[tableName]';

// 基本的なスキーマ（テストを通すための最小限）
export const [formName]Schema = z.object({
  // テストで検証されているフィールド
  // 仕様書で定義されたバリデーション
});

export type [FormName]FormData = z.infer<typeof [formName]Schema>;
```

### 4.2 Server Actionの基本実装

```typescript
// src/app/[path]/forms/[FormName]/[formName]Action.ts
'use server';

import { z } from 'zod';
import { [formName]Schema } from './[formName]Schema';
import type { ActionResult } from '@/types/ActionResult';

export async function [formName]Action(
  formData: z.infer<typeof [formName]Schema>
): Promise<ActionResult> {
  try {
    // バリデーション
    const validatedData = [formName]Schema.parse(formData);
    
    // 最小限の実装（テストを通すため）
    // TODO: 実際のデータベース操作を実装
    
    return {
      success: true,
      message: '処理が完了しました',
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'バリデーションエラーが発生しました',
        errors: error.errors,
      };
    }
    
    return {
      success: false,
      message: 'エラーが発生しました',
    };
  }
}
```

### 4.3 フォームコンポーネントの基本実装

```typescript
// src/app/[path]/forms/[FormName]/[FormName].tsx
'use client';

import { useForm, zodResolver } from '@mantine/form';
import { Button, TextInput, Card } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { [formName]Schema, type [FormName]FormData } from './[formName]Schema';
import { [formName]Action } from './[formName]Action';

export function [FormName]() {
  const form = useForm<[FormName]FormData>({
    resolver: zodResolver([formName]Schema),
    initialValues: {
      // 初期値（テストに必要な分）
    },
  });

  const handleSubmit = async (values: [FormName]FormData) => {
    try {
      const result = await [formName]Action(values);
      
      if (result.success) {
        notifications.show({
          title: '成功',
          message: result.message,
          color: 'green',
        });
        form.reset();
      } else {
        notifications.show({
          title: 'エラー',
          message: result.message,
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'エラー',
        message: '予期しないエラーが発生しました',
        color: 'red',
      });
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        {/* テストで期待されているフォームフィールド */}
        
        <Button type="submit" loading={false}>
          送信
        </Button>
      </form>
    </Card>
  );
}
```

## ステップ5: 段階的テスト実行と修正

作成した実装をテストしながら段階的に修正します。

### 5.1 初回テスト実行
!echo "🟡 初回テスト実行..."
!bun run test 2>&1 | head -30

### 5.2 TypeScriptエラーの確認
!echo "📝 TypeScriptエラーチェック..."
!bun run test --reporter=verbose 2>&1 | grep -E "(Error|error)" | head -10

### 5.3 段階的修正プロセス

**修正が必要な場合の手順:**
1. エラーメッセージを分析
2. 最小限の修正を実施
3. テストを再実行
4. 必要に応じて繰り返し

!echo "🔄 修正後のテスト実行..."
!bun run test

## ステップ6: テスト網羅性の確認

全てのテストが通過することを確認します。

### 6.1 全テスト実行
!echo "✅ 全テスト実行 - GREEN状態確認"
!test_result=$(bun run test 2>&1)
!echo "$test_result"

### 6.2 テスト結果の検証
!if echo "$test_result" | grep -q "FAIL\|✗\|Error"; then
!  echo "❌ まだ失敗しているテストがあります。"
!  echo "失敗テスト詳細:"
!  echo "$test_result" | grep -E "(FAIL|✗|Error)" -A 3
!  echo ""
!  echo "🔧 実装の見直しが必要です。テストエラーを確認してください。"
!  echo "⚠️  テスト修正が必要な場合は、必ずユーザーに確認を求めてください。"
!  exit 1
!else
!  echo "🎉 全てのテストが通過しました！"
!fi

## ステップ7: 品質チェック

実装の品質を確認します。

### 7.1 Biomeチェック
!echo "🔍 Biome品質チェック..."
!bun biome:check 2>&1 | head -10

### 7.2 TypeScriptコンパイルチェック
!echo "📋 TypeScriptコンパイルチェック..."
!bun run test --typecheck 2>&1 | tail -5

## ステップ8: GREENプロセス完了コミット

テストが全て通過した状態でコミットを作成します。

!echo "📝 GREENプロセス完了のコミットを作成..."

!git add .
!git status

!echo ""
!echo "🟢 TDD GREEN: テストを通す実装を完了"
!echo ""
!echo "実装されたファイル:"
!git diff --cached --name-only | grep -v "\.test\.\|\.spec\." | head -10

!git commit -m "🟢 GREEN: $(basename "$latest_spec" .md) の基本実装完了

- テストを通す最小限の実装を作成
- Container/Presentationパターンに準拠
- 全テストの通過を確認
- 品質チェック（Biome）を実行

次: リファクタリングフェーズ(REFACTOR)へ

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

!echo ""
!echo "✅ GREENプロセスが完了しました！"
!echo "📋 次のステップ: リファクタリングフェーズでコード品質を向上させる"
!echo ""
!echo "💡 ヒント:"
!echo "   - 全テストが通過していることを確認済み"
!echo "   - 必要最小限の実装でテストをクリア"
!echo "   - 次は /refactor コマンドで品質向上を"

## ❗ 重要な注意事項

### テスト修正が必要な場合
テストの修正が必要と判断された場合は、以下の手順に従ってください：

1. **ユーザーに確認**: 必ずユーザーの許可を得る
2. **修正理由の説明**: なぜテスト修正が必要かを明確に説明
3. **修正範囲の最小化**: 必要最小限の修正に留める
4. **仕様との整合性**: 仕様書との整合性を保つ

### 基本方針
- **実装優先**: 基本的には実装側を修正してテストを通す
- **テスト信頼性**: テストはユーザーの意図を反映した正確な仕様
- **最小実装**: テストを通す最小限の実装から開始

---

**GREENプロセス完了** 🟢
- 仕様書・テスト確認 ✅
- 基本実装作成 ✅  
- テスト実行・修正 ✅
- 全テスト通過確認 ✅
- 品質チェック ✅
- コミット作成 ✅