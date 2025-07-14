---
description: "TDDのREDプロセス - 失敗するテストを作成してコミット"
allowed-tools: ["Bash", "Write", "Read", "LS", "Glob", "Grep", "Edit", "MultiEdit"]
---

# /red - TDD REDプロセス実行コマンド

## ステップ1: 最新仕様ファイルの確認

最新の仕様ファイルを探します。

!latest_spec=$(ls -t specs/*.md 2>/dev/null | head -1)
!if [ -z "$latest_spec" ]; then echo "❌ エラー: 仕様ファイルが見つかりません。先に /start コマンドを実行してください。"; exit 1; fi
!echo "📋 仕様ファイル: $latest_spec"

## ステップ2: 仕様書の内容確認

仕様書を読み込んで、実装すべき機能を理解しましょう。

**仕様書の内容を確認してください:**

!cat "$latest_spec"

## ステップ3: プロジェクト構造分析と準備

現在のプロジェクト構造を分析し、新機能に必要なディレクトリ構造を決定します。

### 3.1 現在の構造確認
!echo "🔍 現在のsrc/app構造:"
!find src/app -type d | grep -E "(admin|_components|forms)" | head -10

### 3.2 既存パターンの参考確認
!echo "📁 参考: adminの構造例:"
!ls -la src/app/admin/_components/ | head -5

## ステップ4: ディレクトリ構造作成

仕様に基づいて必要なディレクトリとファイル構造を作成します。

**以下を仕様に合わせて調整してください:**

### 4.1 基本ディレクトリ作成
!echo "📁 基本ディレクトリ構造を作成..."

**注意: 以下は例です。仕様に応じて調整してください:**

```bash
# 例: 新しいページまたはコンポーネント用ディレクトリ
mkdir -p "src/app/[機能名]/_components"
mkdir -p "src/app/[機能名]/_components/forms"

# または既存ディレクトリへの追加
mkdir -p "src/app/admin/_components/[新機能名]"
mkdir -p "src/app/admin/_components/forms/[新フォーム名]"
```

## ステップ5: テストファイル作成

仕様通りの実装がなされれば通過するテストを作成します。

### 5.1 Presentationコンポーネントテスト

**例: 表示コンポーネントのテスト**

```typescript
// src/app/[path]/[ComponentName]Presentation.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MantineTestProvider } from '@/test/MantineTestProvider';
import { [ComponentName]Presentation } from './[ComponentName]Presentation';

describe('[ComponentName]Presentation', () => {
  it('[仕様に基づく基本表示テスト]', () => {
    // Arrange: テストデータ準備
    const mockData = {
      // 仕様に基づくデータ構造
    };

    // Act: コンポーネント描画
    render(
      <MantineTestProvider>
        <[ComponentName]Presentation {...mockData} />
      </MantineTestProvider>
    );

    // Assert: 仕様通りの表示確認
    expect(screen.getByText('期待される表示内容')).toBeInTheDocument();
  });

  it('[仕様に基づくインタラクションテスト]', async () => {
    // 仕様に基づくユーザーインタラクションのテスト
  });

  it('[エッジケースのテスト]', () => {
    // 仕様で定義されたエッジケースのテスト
  });
});
```

### 5.2 フォームコンポーネントテスト（該当する場合）

```typescript
// src/app/[path]/forms/[FormName]/[FormName].test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MantineTestProvider } from '@/test/MantineTestProvider';
import { [FormName] } from './[FormName]';

describe('[FormName]', () => {
  it('仕様通りのフォーム送信が可能', async () => {
    // 仕様に基づくフォームテスト
  });

  it('バリデーションが仕様通りに動作', async () => {
    // 仕様に基づくバリデーションテスト
  });
});
```

### 5.3 Server Actionテスト（該当する場合）

```typescript
// src/app/[path]/forms/[FormName]/[actionName]Action.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { [actionName]Action } from './[actionName]Action';

describe('[actionName]Action', () => {
  it('仕様通りのデータ処理が実行される', async () => {
    // 仕様に基づくServer Actionテスト
  });

  it('バリデーションエラーが適切に処理される', async () => {
    // 仕様に基づくエラーハンドリングテスト
  });
});
```

## ステップ6: スキーマファイル作成（データベース関連の場合）

データベースが関わる場合のスキーマファイル:

```typescript
// src/lib/db/schema/[tableName].ts
import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { [tableName] } from './[tableName]';

export const insert[TableName]Schema = createInsertSchema([tableName], {
  // 仕様に基づくカスタムバリデーション
});

export const select[TableName]Schema = createSelectSchema([tableName]);

export type Insert[TableName] = z.infer<typeof insert[TableName]Schema>;
export type Select[TableName] = z.infer<typeof select[TableName]Schema>;
```

## ステップ7: REDプロセス確認

作成したテストが意図通り失敗することを確認します。

!echo "🔴 REDプロセス確認: テストを実行して失敗を確認..."
!bun run test 2>&1 | grep -E "(FAIL|✗|Error)" | head -10

!echo ""
!echo "📊 テスト結果サマリー:"
!bun run test --reporter=verbose 2>/dev/null | tail -5

## ステップ8: テスト網羅性確認

作成したテストが仕様の要件を網羅しているか確認してください。

**チェックリスト:**
- [ ] 基本的な機能動作のテスト
- [ ] ユーザーインタラクションのテスト  
- [ ] バリデーション・エラーハンドリングのテスト
- [ ] エッジケースのテスト
- [ ] 仕様で定義された全ての要件がテストでカバーされている

## ステップ9: REDプロセス完了コミット

!echo "📝 REDプロセス完了のコミットを作成..."

!git add .
!git status

!echo ""
!echo "🔴 TDD RED: 失敗するテストファイルを作成完了"
!echo ""
!echo "作成されたファイル:"
!git diff --cached --name-only | grep -E "\.(test|spec)\.(ts|tsx)$"

!git commit -m "🔴 RED: $(basename "$latest_spec" .md) の失敗テスト作成

- 仕様に基づくテストファイル作成
- 必要なディレクトリ構造を準備
- 実装がなされれば通過するテストを定義
- エッジケースとバリデーションテストを含む

次: 実装フェーズ(GREEN)へ

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

!echo ""
!echo "✅ REDプロセスが完了しました！"
!echo "📋 次のステップ: 実装フェーズに進んでテストを通してください"
!echo ""
!echo "💡 ヒント:"
!echo "   - テストが失敗していることを確認してから実装を開始"
!echo "   - テストファースト開発でクリーンなコードを心がける"
!echo "   - 実装完了後は /green コマンドでGREENプロセスへ"

---

**REDプロセス完了** 🔴
- 仕様書確認 ✅
- ディレクトリ構造作成 ✅
- 失敗するテスト作成 ✅
- テスト網羅性確認 ✅
- コミット作成 ✅
