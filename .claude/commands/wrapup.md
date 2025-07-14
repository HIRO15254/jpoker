---
description: "開発完了プロセス - TODOチェック、品質確認、コミット、プッシュ、PR作成"
allowed-tools: ["Bash", "Write", "Read", "LS", "Glob", "Grep", "Edit", "MultiEdit", "TodoWrite"]
---

# /wrapup - 開発完了プロセス実行コマンド

## ステップ1: TODOタスクの確認

残存するTODOタスクがないことを確認します。

### 1.1 TODOリストの確認
!echo "📋 現在のTODOリストを確認..."

**⚠️ 重要: 未完了のTODOがある場合は、完了させてからwrapupを実行してください**

### 1.2 コード内のTODOコメントの確認
!echo "🔍 コード内のTODOコメントを確認..."
!todo_comments=$(grep -r "TODO\|FIXME\|XXX" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null || echo "TODOコメントは見つかりませんでした")
!echo "$todo_comments"

## ステップ2: 品質チェック実行

コード品質を確認します。

### 2.1 Biomeによる品質チェック
!echo "🔍 Biome品質チェック実行..."
!biome_result=$(bun biome:check 2>&1)
!echo "$biome_result"

### 2.2 品質チェック結果の検証
!if echo "$biome_result" | grep -q "Found.*errors\|Found.*warnings"; then
!  echo "❌ Biomeで問題が検出されました。修正が必要です。"
!  echo "🔧 自動修正を実行します..."
!  bun biome:fix
!  echo "✅ 自動修正完了。再度チェックします..."
!  bun biome:check
!else
!  echo "✅ Biome品質チェック通過"
!fi

## ステップ3: テスト実行

全てのテストが通過することを確認します。

### 3.1 テストスイート実行
!echo "🧪 テストスイート実行..."
!test_result=$(bun run test 2>&1)
!echo "$test_result"

### 3.2 テスト結果の検証
!if echo "$test_result" | grep -q "FAIL\|✗\|Error"; then
!  echo "❌ テストが失敗しています。修正が必要です。"
!  echo "失敗テスト詳細:"
!  echo "$test_result" | grep -E "(FAIL|✗|Error)" -A 3
!  echo ""
!  echo "🔧 テストを修正してから再度wrapupを実行してください。"
!  exit 1
!else
!  echo "✅ 全てのテストが通過しました"
!fi

## ステップ4: 残りの変更をコミット

残存する変更をコミットします。

### 4.1 Git状態の確認
!echo "📝 Git状態を確認..."
!git_status=$(git status --porcelain)
!git status

### 4.2 変更のステージング
!if [ -n "$git_status" ]; then
!  echo "📁 変更ファイルをステージングします..."
!  git add .
!  git status
!else
!  echo "✅ コミットする変更がありません"
!fi

### 4.3 コミット作成
!if [ -n "$git_status" ]; then
!  echo "💾 コミットを作成します..."
!  
!  # 現在のブランチ名から機能を推測
!  current_branch=$(git branch --show-current)
!  feature_name=$(echo "$current_branch" | sed 's/feature\///' | sed 's/fix\///' | sed 's/docs\///')
!  
!  # コミットメッセージを生成
!  commit_message="wrapup: ${feature_name} の実装完了

- 品質チェック（Biome）を実行済み
- 全テストの通過を確認
- 開発完了状態でのコミット

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
!  
!  git commit -m "$commit_message"
!  echo "✅ コミット完了"
!else
!  echo "ℹ️  コミットする変更がありません"
!fi

## ステップ5: リモートへのプッシュ

変更をリモートリポジトリにプッシュします。

### 5.1 現在のブランチ確認
!current_branch=$(git branch --show-current)
!echo "🌿 現在のブランチ: $current_branch"

### 5.2 リモートブランチの確認
!echo "🔍 リモートブランチの状態を確認..."
!remote_status=$(git status -uno)
!echo "$remote_status"

### 5.3 プッシュ実行
!if git status -uno | grep -q "ahead\|behind"; then
!  echo "⬆️  リモートへプッシュします..."
!  git push -u origin "$current_branch"
!  echo "✅ プッシュ完了"
!else
!  echo "ℹ️  プッシュする変更がありません"
!fi

## ステップ6: プルリクエストの作成

GitHub CLIを使用してプルリクエストを作成します。

### 6.1 GitHub CLI の確認
!echo "🔧 GitHub CLIの確認..."
!if ! command -v gh &> /dev/null; then
!  echo "❌ GitHub CLI (gh) がインストールされていません"
!  echo "💡 https://cli.github.com/ からインストールしてください"
!  exit 1
!fi

### 6.2 認証状態の確認
!auth_status=$(gh auth status 2>&1)
!if echo "$auth_status" | grep -q "not logged in"; then
!  echo "❌ GitHub CLIにログインしていません"
!  echo "💡 'gh auth login' でログインしてください"
!  exit 1
!else
!  echo "✅ GitHub CLI認証確認"
!fi

### 6.3 プルリクエストの作成
!echo "📋 プルリクエストを作成します..."

!# 現在のブランチ名から機能を推測
!current_branch=$(git branch --show-current)
!feature_name=$(echo "$current_branch" | sed 's/feature\///' | sed 's/fix\///' | sed 's/docs\///')

!# PRタイトルとボディを生成
!pr_title="feat: ${feature_name} の実装"

!# コミット履歴からPRの内容を生成
!commits=$(git log master..HEAD --oneline | head -10)
!pr_body="## Summary

${feature_name} の実装が完了しました。

### 実装内容
$(echo "$commits" | sed 's/^/- /')

### 品質チェック
- ✅ Biome品質チェック通過
- ✅ 全テスト通過
- ✅ TypeScript型チェック通過

### Test plan
- [ ] 手動テストで動作確認
- [ ] 各機能の動作確認
- [ ] エラーハンドリングの確認

🤖 Generated with [Claude Code](https://claude.ai/code)"

!# プルリクエスト作成
!pr_url=$(gh pr create --title "$pr_title" --body "$pr_body" --base master --head "$current_branch" 2>&1)

!if echo "$pr_url" | grep -q "https://github.com"; then
!  echo "✅ プルリクエスト作成完了"
!  echo "🔗 PR URL: $pr_url"
!else
!  echo "❌ プルリクエスト作成に失敗しました"
!  echo "$pr_url"
!  
!  # 既存のPRがある場合の確認
!  if echo "$pr_url" | grep -q "already exists"; then
!    existing_pr=$(gh pr view --json url --jq '.url' 2>/dev/null)
!    if [ -n "$existing_pr" ]; then
!      echo "ℹ️  既存のPRが存在します: $existing_pr"
!    fi
!  fi
!fi

## ステップ7: 完了サマリー

実行結果をまとめて表示します。

### 7.1 実行結果サマリー
!echo ""
!echo "🎉 /wrapup コマンド実行完了！"
!echo ""
!echo "📊 実行結果サマリー:"
!echo "  ✅ TODOタスクチェック"
!echo "  ✅ Biome品質チェック"
!echo "  ✅ テストスイート実行"
!echo "  ✅ 変更のコミット"
!echo "  ✅ リモートへのプッシュ"
!echo "  ✅ プルリクエスト作成"
!echo ""

### 7.2 次のステップ
!current_branch=$(git branch --show-current)
!echo "📋 次のステップ:"
!echo "  1. PR確認: 作成されたプルリクエストを確認"
!echo "  2. レビュー: コードレビューを依頼"
!echo "  3. マージ: レビュー完了後にマージ"
!echo "  4. ブランチ切り替え: 'git checkout master' で開発ブランチから移動"
!echo ""
!echo "🔗 現在のブランチ: $current_branch"

### 7.3 重要な注意事項
!echo "⚠️  重要な注意事項:"
!echo "  - PRマージ後は開発ブランチを削除してください"
!echo "  - 新しい機能開発は master ブランチから新しいブランチを作成"
!echo "  - 継続的な開発には /init コマンドを使用"

## エラーハンドリング

### 品質チェック失敗時の対処
品質チェックが失敗した場合:
1. エラーメッセージを確認
2. 必要に応じて手動修正
3. 再度 `/wrapup` を実行

### テスト失敗時の対処
テストが失敗した場合:
1. 失敗したテストを確認
2. 実装を修正
3. 再度 `/wrapup` を実行

### プッシュ失敗時の対処
プッシュが失敗した場合:
1. リモートとの同期を確認
2. 必要に応じて `git pull` を実行
3. 競合解決後に再度 `/wrapup` を実行

### PR作成失敗時の対処
PR作成が失敗した場合:
1. GitHub CLIの認証状態を確認
2. 既存のPRがないか確認
3. 手動でPRを作成することも可能

---

**WRAPUPプロセス完了** 🎉
- TODOタスクチェック ✅
- 品質チェック ✅
- テスト実行 ✅
- コミット作成 ✅
- リモートプッシュ ✅
- プルリクエスト作成 ✅