# CLAUDE.md

## プロジェクト概要
Next.js 15.3.4とTypeScriptを使用したポーカーアプリケーション (jpoker)。React 19とNext.js App Router、Mantineコンポーネントライブラリを採用。

## 開発コマンド
**基本開発**
- `bun dev` - 開発サーバー起動 (Turbopack使用、http://localhost:3000)
- `bun build` - 本番用ビルド
- `bun start` - 本番サーバー起動

**品質チェック（統合）**
- `bun biome:check` - Biomeによるlintとformat全チェック
- `bun biome:fix` - Biomeによる自動修正

**テスト**
- `bun run test` - Vitestを使用したテスト実行（TypeScript型チェック含む）
- `bun run test:watch` - テストのwatch mode（型チェック含む）
- `bun run test:coverage` - カバレッジレポート付きテスト（型チェック含む）
- `bun run test:ui` - Vitest UI でのテスト実行（型チェック含む）
- `bun run test:ci` - CI環境でのテスト実行（型チェック含む）

**データベース管理**
- `bun run db:generate` - Drizzleスキーマ生成
- `bun run db:migrate` - データベースマイグレーション実行
- `bun run db:push` - スキーマをデータベースに直接プッシュ
- `bun run db:studio` - Drizzle Studio起動（GUI管理ツール）
- `bun run db:seed` - データベースシード実行

**Supabase管理**
- `bun run supabase:start` - ローカルSupabase環境起動
- `bun run supabase:stop` - ローカルSupabase環境停止
- `bun run supabase:status` - Supabase環境ステータス確認
- `bun run supabase:reset` - データベースリセット

**パッケージ管理**
- `bun add <package-name>` - 依存関係追加
- `bun add -d <package-name>` - 開発依存関係追加
- `bun remove <package-name>` - パッケージ削除

**カスタムコマンド**
- `/init <タスク概要>` - 新機能開発のブランチ作成・仕様書生成
- `/wrapup` - 開発完了プロセス（TODO確認・品質チェック・コミット・プッシュ・PR作成）

## 開発ワークフロー
### TDD サイクル
1. **RED**: 失敗するテストを書く
   - 期待する動作を定義
   - エッジケースを明確化
   - 意図的に失敗するテストを作成

2. **GREEN**: テストを通す最小限のコード
   - 機能性を優先し、エレガンスは後回し
   - 最短経路でテストをパスさせる

3. **REFACTOR**: テストの安全網のもとでコード改善
   - 品質向上とリファクタリング
   - テストカバレッジを維持

### 日常開発フロー
1. 新しいブランチを作成
2. **テストファースト**: 機能のテストを先に書く
3. **実装**: テストを通すコードを書く
4. **品質チェック**: `bun biome:check`を実行
5. **テスト実行**: `bun run test`でテストを確認
6. **リファクタリング**: 必要に応じてコードを改善
7. プルリクエスト作成

## 技術スタック
**フロントエンド**
- **Next.js 15.3.4**: App Router、Server Components
- **React 19**: Concurrent Rendering、Suspense
- **TypeScript**: 厳格設定、パスエイリアス (`@/*` → `./src/*`)
- **Mantine**: UIコンポーネントライブラリ
  - Core、Form、Hooks、Notifications

**データベース・ORM**
- **Supabase**: PostgreSQLベースのBaaS
- **Drizzle ORM**: TypeScript-first ORM

**開発ツール**
- **Bun**: パッケージマネージャー
- **Vitest**: テストフレームワーク、モック、カバレッジ
- **Biome**: Linter、Formatter（統合品質チェック）
- **Testing Library**: React Testing Library、Jest DOM

## プロジェクト構造
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # ホームページ
│   ├── _components/       # 共通コンポーネント
│   ├── admin/             # 管理画面（理想的な設計パターン例）
│   ├── api/               # API Routes
│   ├── auth/              # 認証関連ページ
│   └── __tests__/         # テストファイル
├── lib/                   # 共通ライブラリ
│   ├── actions/           # Server Actions
│   ├── auth/              # 認証ロジック
│   ├── db/                # データベース関連
│   │   ├── connection.ts  # DB接続設定
│   │   ├── schema/        # Drizzleスキーマ定義
│   │   └── migrations/    # マイグレーションファイル
│   └── supabase/          # Supabase設定
├── types/                 # 型定義
.claude/                   # カスタムコマンド
├── commands/              # プロジェクト固有コマンド
specs/                     # 仕様書
test/                      # テスト設定
public/                    # 静的ファイル
```

## アーキテクチャ原則
**コンポーネント設計**
- **Server Components優先**: SSRとデータフェッチを重視
- **Composition Pattern**: 再利用可能なコンポーネント構成
- **Container/Presentational**: データロジックと表示の分離
  - **Container**: データ取得・状態管理を担当（例: `UserData`）
  - **Presentation**: UI描画のみを担当（例: `UserDataPresentation`）
  - **テスト**: Presentationコンポーネントに対してUIテストを作成

**パフォーマンス**
- **多層キャッシュ**: Full Route Cache、Data Cache、Router Cache
- **Suspense Streaming**: 段階的ローディング
- **N+1クエリ防止**: 効率的なデータフェッチパターン

## 標準ディレクトリ構造・設計パターン
**`app/admin`を参考にした理想的な実装パターン**

### 表示コンポーネント（一覧・詳細表示）
```
ComponentName/
├── ComponentNameContainer.tsx       # Server Component
│   ├── 'server-only'指定
│   ├── Drizzle ORMによるデータフェッチ
│   └── Presentationコンポーネントに props 注入
├── ComponentNamePresentation.tsx    # Client Component
│   ├── 'use client'指定
│   ├── Mantineコンポーネント使用
│   ├── UIロジック・イベントハンドリング
│   └── 型安全なprops interface定義
├── ComponentNamePresentation.test.tsx # Presentationテスト
│   ├── @testing-library/react使用
│   ├── ユーザー操作の動作テスト
│   └── 実装詳細ではなく動作をテスト
└── index.ts                        # エクスポート
    └── Containerをデフォルトエクスポート
```

### フォームコンポーネント（作成・編集・削除）
```
forms/FormName/
├── FormName.tsx                     # Client Component
│   ├── 'use client'指定
│   ├── Mantine useForm + zod4Resolver
│   ├── Server Action呼び出し
│   ├── Notifications連携
│   └── Loading状態管理
├── FormName.test.tsx               # フォームテスト
│   ├── フォームバリデーションテスト
│   ├── ユーザー入力シミュレーション
│   └── 成功・エラーシナリオテスト
├── formNameAction.ts               # Server Action
│   ├── 'use server'指定
│   ├── Zodスキーマバリデーション
│   ├── Drizzle ORMによるCRUD操作
│   └── ActionResult型の戻り値
├── formNameAction.test.tsx         # Server Actionテスト
│   ├── バリデーションテスト
│   ├── データベース操作テスト
│   └── エラーハンドリングテスト
├── formNameSchema.ts               # Zodバリデーションスキーマ
│   ├── drizzle-zod使用
│   ├── createInsertSchema / createSelectSchema
│   └── カスタムバリデーション定義
└── index.ts                        # エクスポート
    └── フォームコンポーネントのみエクスポート
```

### 設計原則詳細
**Container/Presentation分離**
- **Container（xxxContainer.tsx）**
  - `import 'server-only'`必須
  - データフェッチ専用（Drizzle ORMクエリ）
  - ビジネスロジック処理
  - Presentationに型安全なpropsを渡す

- **Presentation（xxxPresentation.tsx）**  
  - `'use client'`指定
  - UI描画・ユーザーインタラクション専用
  - Mantineコンポーネント活用
  - 明確なprops interface定義

**フォーム設計パターン**
- **Mantine Form統合**: `useForm` + `zod4Resolver`で型安全なバリデーション
- **Server Actions**: 'use server'でサーバーサイド処理、ActionResult型で統一
- **Drizzle-Zod連携**: `createInsertSchema`でスキーマから自動生成

**エクスポート戦略**
- **index.ts**: 実装詳細を隠蔽、外部にはContainerのみ公開
- **名前付きエクスポート**: テスト用途でPresentationも必要に応じて公開

**テスト戦略**
- **Presentationテスト**: UI動作・ユーザーインタラクションに集中
- **Server Actionテスト**: ビジネスロジック・データ整合性に集中
- **実装詳細ではなく動作をテスト**: リファクタリング耐性を重視

## コミュニケーション・Git運用
**コミュニケーション**
- すべての会話、コードコメント、技術議論は日本語で実施

**Git Workflow**
- **ベースブランチ**: `master`
- **ブランチ命名**: `feature/機能名`、`fix/修正内容`、`docs/ドキュメント更新`
- **プルリクエスト**: `master`ブランチ向けに作成
- **カスタムコマンド活用**: `/init <タスク概要>`で自動ブランチ作成・仕様書生成

## 品質保証
**自動チェック**
- コミット前に必ず`bun biome:check`と`bun run test`を実行
- CI/CDパイプラインでテストとビルドを自動化
- 高いテストカバレッジを維持

**テスト戦略**
- 実装詳細ではなく動作をテスト
- テストを生きたドキュメントとして活用
- リファクタリング時の信頼性を確保

**型安全性の原則**
- `as any`の使用を禁止 - 常に正確な型定義を使用
- モックでも完全な型を作成し、型安全性を維持
- 型エラーは根本的な設計問題を示すため、型でごまかさない

**データベースアクセス**
- **Drizzle ORM必須**: 全てのデータベースクエリはDrizzle ORMを使用
- 生のSQLや他のクエリ方法は禁止
- スキーマ定義とクエリビルダーによる型安全性を重視

**API設計**
- **認証エンドポイント**: `/me`エンドポイントのみでSupabaseログインユーザー取得を許可
- **他のエンドポイント**: `/me`以外でのSupabaseログインユーザー取得は禁止
- **認証情報が必要な場合**: `/me`をフェッチしてユーザー情報を取得する

**Server Actions と revalidatePath**
- **認証状態変更時**: ログイン・ログアウト後はrevalidatePathでサーバーコンポーネントを更新
- **実装場所**: `/lib/actions/auth.ts`にServer Actionを定義
- **更新対象**: 認証状態依存ページは`revalidatePath('/', 'layout')`で全体更新
- **呼び出し場所**: 
  - ログイン後: 認証コールバックページで`revalidateAfterLogin()`
  - ログアウト時: AuthButtonコンポーネントで`signOut()` Server Action
  - 認証状態変更時: useAuthフックで`revalidateAuthState()`

## 公式ドキュメント参照
**必須参照ドキュメント**
- **Next.js**: [公式ドキュメント](https://nextjs.org/docs) - App Router、サーバーコンポーネント
- **React**: [公式ドキュメント](https://ja.react.dev/) - Hooks、状態管理
- **TypeScript**: [公式ドキュメント](https://www.typescriptlang.org/docs/) - 型システム、設定
- **Mantine**: [公式ドキュメント](https://mantine.dev/) - コンポーネント、フォーム
- **Supabase**: [公式ドキュメント](https://supabase.com/docs) - データベース、認証、API
- **Drizzle ORM**: [公式ドキュメント](https://orm.drizzle.team/docs/overview) - スキーマ定義、クエリ
- **Bun**: [公式ドキュメント](https://bun.sh/docs) - パッケージ管理、テストランナー
- **Vitest**: [公式ドキュメント](https://vitest.dev/) - テストフレームワーク、モック、カバレッジ
- **Biome**: [公式ドキュメント](https://biomejs.dev/ja/) - Linter、Formatter設定

**参照ガイドライン**
- 新機能実装前に必ず関連する公式ドキュメントを確認
- 最新のベストプラクティスを公式ドキュメントから取得
- 問題解決時はstack overflowより公式ドキュメントを優先
- バージョン更新時は必ず変更ログと移行ガイドを確認
