import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"

const originalEmitWarning = process.emitWarning.bind(process)

process.emitWarning = ((warning: string | Error, ...args: unknown[]) => {
  const warningText = typeof warning === "string" ? warning : warning.message
  if (warningText.includes("--localstorage-file") && warningText.includes("without a valid path")) {
    return
  }

  // @type-escape: Node's overloaded emitWarning signature is broader than this local filter wrapper.
  return originalEmitWarning(warning as never, ...(args as []))
}) as typeof process.emitWarning

// jsdom with opaque origin throws SecurityError on localStorage access;
// provide a minimal stub so components can read/write without per-test boilerplate.
if (typeof window !== "undefined" && (!window.localStorage || typeof window.localStorage.getItem !== "function")) {
  const store = new Map<string, string>()
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, String(value)),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      get length() { return store.size },
    },
    writable: true,
    configurable: true,
  })
}

// jsdom doesn't implement pointer capture APIs used by some Radix UI primitives
if (typeof Element !== "undefined" && !Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
}
if (typeof Element !== "undefined" && !Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {}
}
if (typeof Element !== "undefined" && !Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {}
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.useRealTimers()
  if (typeof window !== "undefined" && window.localStorage && typeof window.localStorage.clear === "function") {
    window.localStorage.clear()
  }
})
