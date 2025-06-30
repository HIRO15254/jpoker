// Jest DOM matchers（expect拡張）をインポート
import '@testing-library/jest-dom'

// React 19の新機能に対応するためのポリフィル
// TextEncoder/TextDecoderのグローバル設定
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder
}

// fetch APIのモック（必要に応じて）
// global.fetch = jest.fn()

// ResizeObserverのモック（Mantine UIで使用される可能性があるため）
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// IntersectionObserverのモック
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// matchMediaのモック（レスポンシブテスト用）
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // 非推奨だが後方互換性のため
    removeListener: jest.fn(), // 非推奨だが後方互換性のため
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// カスタムエラーハンドリング（必要に応じて）
// console.error をモックして、テスト中の不要なエラーログを抑制
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})