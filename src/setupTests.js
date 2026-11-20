import '@testing-library/jest-dom/vitest'

// Polyfill JSDOM untuk Toast UI Editor (matchMedia, selection, range, canvas)
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  })
}
if (!document.createRange) {
  document.createRange = () => ({
    setStart() {},
    setEnd() {},
    commonAncestorContainer: document.body,
    getBoundingClientRect: () => ({ top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }),
    getClientRects: () => [],
  })
}
if (!window.getSelection) {
  window.getSelection = () => ({ removeAllRanges() {}, addRange() {}, rangeCount: 0 })
}
HTMLCanvasElement.prototype.getContext = () => null

afterEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})
