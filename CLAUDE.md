# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a Next.js 15.3.4 project with TypeScript, bootstrapped with `create-next-app`. It's a poker application (jpoker) using React 19 and the Next.js App Router architecture.

## Development Commands
- `bun dev` - Start development server with Turbopack (opens at http://localhost:3000)
- `bun build` - Build the application for production
- `bun start` - Start the production server
- `bun lint` - Run ESLint for code quality checks
- `bun biome:check` - Run Biome for linting and formatting checks
- `bun biome:fix` - Fix linting and formatting issues with Biome
- `bun biome:format` - Format code with Biome
- `bun biome:lint` - Run Biome linter only

## Testing Commands
- `bun test` - Run tests with Bun's built-in test runner
- `bun test:watch` - Run tests in watch mode
- `bun test:coverage` - Run tests with coverage report
- `bun test:ci` - Run tests in CI mode (with coverage)

## Package Manager
- **Bun**: このプロジェクトではパッケージマネージャーとしてBunを使用します
- 依存関係の追加: `bun add <package-name>`
- 開発依存関係の追加: `bun add -d <package-name>`
- パッケージの削除: `bun remove <package-name>`

## Architecture & Structure
- **App Router**: Uses Next.js App Router pattern in `src/app/`
- **TypeScript**: Strict TypeScript configuration with path aliases (`@/*` maps to `./src/*`)
- **Styling**: Global CSS with CSS custom properties for light/dark theme support
- **Font**: Uses Geist Sans and Geist Mono fonts from Google Fonts
- **Layout**: Root layout defines the HTML structure and font variables

## Key Directories
- `src/app/` - Main application code using App Router
- `src/app/layout.tsx` - Root layout component with metadata and font setup
- `src/app/page.tsx` - Homepage component
- `src/app/globals.css` - Global styles with theme variables
- `public/` - Static assets (SVG icons)

## Configuration Files
- `next.config.ts` - Next.js configuration (currently minimal)
- `tsconfig.json` - TypeScript config with strict mode and path aliases
- `package.json` - Project dependencies and scripts

## Development Philosophy

### TDD (Test-Driven Development)
This project follows TDD principles with the classic Red-Green-Refactor cycle:

1. **RED**: Write a failing test first
   - Define expected behavior before implementation
   - Clarify requirements and edge cases
   - Intentionally create tests that fail

2. **GREEN**: Implement minimal code to pass the test
   - Focus on making tests pass quickly
   - Prioritize functionality over code elegance
   - Take the shortest path to working solution

3. **REFACTOR**: Improve and optimize code with confidence
   - Enhance code quality while tests provide safety net
   - Continuous improvement of codebase
   - Maintain test coverage during refactoring

### Next.js Architecture Principles

#### Component Design
- **Server Components First**: Prioritize server-side rendering and data fetching
- **Composition Pattern**: Build complex UIs from simple, reusable components  
- **Container/Presentational**: Separate data logic from presentation logic
- **Colocated Data Fetching**: Fetch data close to where it's used

#### Performance & Caching
- **Multiple Cache Layers**: Utilize Full Route Cache, Data Cache, and Router Cache
- **Request Memoization**: Avoid duplicate requests in component tree
- **Suspense Streaming**: Enable progressive loading with React Suspense
- **N+1 Query Prevention**: Design efficient data fetching patterns

#### Server vs Client Components
- **Server Components**: Default choice for data fetching and static content
- **Client Components**: Use for interactivity, browser APIs, and state management
- **Concurrent Rendering**: Leverage parallel data fetching where possible

## Testing Strategy
- Write tests before implementation (TDD)
- Focus on behavior testing over implementation details
- Use tests as living documentation
- Maintain high test coverage for confidence in refactoring
- Integrate testing into CI/CD pipeline

## Communication Guidelines
- すべての会話は日本語で行う
- コードコメントも日本語で記述する
- 技術的な説明や議論も日本語で実施する

## Git Workflow
- **ベースブランチ**: `dev`ブランチを開発のメインブランチとして使用
- **作業フロー**: 新機能や修正は必ず新しいブランチを作成
- **プルリクエスト**: 作業完了後は`dev`ブランチに向けてPRを作成
- **ブランチ命名**: `feature/機能名`、`fix/修正内容`、`docs/ドキュメント更新`等の形式を使用
