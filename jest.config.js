const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Next.jsアプリのディレクトリを指定
  dir: './',
})

// Jestの設定
const customJestConfig = {
  // テスト環境をjsdomに設定（ブラウザ環境をシミュレート）
  testEnvironment: 'jsdom',
  
  // セットアップファイルを指定
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // テストファイルのパターンを指定
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  
  // カバレッジレポートの設定
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.{ts,tsx}',
  ],
  
  // モジュールパスマッピング（tsconfig.jsonのpathsと同期）
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // 変換対象外のファイルを指定
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  
  // テストタイムアウト設定（デフォルトは5秒）
  testTimeout: 10000,
}

// Next.jsの設定とカスタム設定をマージ
module.exports = createJestConfig(customJestConfig)