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
- `bun test` - Bunテストランナーでテスト実行
- `bun test:watch` - テストのwatch mode
- `bun test:coverage` - カバレッジレポート付きテスト

**パッケージ管理**
- `bun add <package-name>` - 依存関係追加
- `bun add -d <package-name>` - 開発依存関係追加
- `bun remove <package-name>` - パッケージ削除

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
5. **テスト実行**: `bun test`でテストを確認
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
- **Bun**: パッケージマネージャー、テストランナー
- **Biome**: Linter、Formatter（統合品質チェック）
- **Testing Library**: React Testing Library、Jest DOM

## プロジェクト構造
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # ホームページ
│   ├── _components/       # 共通コンポーネント
│   └── __tests__/         # テストファイル
test/                      # テスト設定
public/                    # 静的ファイル
```

## アーキテクチャ原則
**コンポーネント設計**
- **Server Components優先**: SSRとデータフェッチを重視
- **Composition Pattern**: 再利用可能なコンポーネント構成
- **Container/Presentational**: データロジックと表示の分離

**パフォーマンス**
- **多層キャッシュ**: Full Route Cache、Data Cache、Router Cache
- **Suspense Streaming**: 段階的ローディング
- **N+1クエリ防止**: 効率的なデータフェッチパターン

## コミュニケーション・Git運用
**コミュニケーション**
- すべての会話、コードコメント、技術議論は日本語で実施

**Git Workflow**
- **ベースブランチ**: `dev`
- **ブランチ命名**: `feature/機能名`、`fix/修正内容`、`docs/ドキュメント更新`
- **プルリクエスト**: `dev`ブランチ向けに作成

## 品質保証
**自動チェック**
- コミット前に必ず`bun biome:check`と`bun test`を実行
- CI/CDパイプラインでテストとビルドを自動化
- 高いテストカバレッジを維持

**テスト戦略**
- 実装詳細ではなく動作をテスト
- テストを生きたドキュメントとして活用
- リファクタリング時の信頼性を確保

## 公式ドキュメント参照
**必須参照ドキュメント**
- **Next.js**: [公式ドキュメント](https://nextjs.org/docs) - App Router、サーバーコンポーネント
- **React**: [公式ドキュメント](https://ja.react.dev/) - Hooks、状態管理
- **TypeScript**: [公式ドキュメント](https://www.typescriptlang.org/docs/) - 型システム、設定
- **Mantine**: [公式ドキュメント](https://mantine.dev/) - コンポーネント、フォーム
- **Supabase**: [公式ドキュメント](https://supabase.com/docs) - データベース、認証、API
- **Drizzle ORM**: [公式ドキュメント](https://orm.drizzle.team/docs/overview) - スキーマ定義、クエリ
- **Bun**: [公式ドキュメント](https://bun.sh/docs) - パッケージ管理、テストランナー
- **Biome**: [公式ドキュメント](https://biomejs.dev/ja/) - Linter、Formatter設定

**参照ガイドライン**
- 新機能実装前に必ず関連する公式ドキュメントを確認
- 最新のベストプラクティスを公式ドキュメントから取得
- 問題解決時はstack overflowより公式ドキュメントを優先
- バージョン更新時は必ず変更ログと移行ガイドを確認
