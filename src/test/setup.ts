import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import type { WriteStream } from 'node:tty'

const originalConsoleError = console.error
const originalConsoleLog = console.log
const originalConsoleWarn = console.warn
const originalStdoutWrite = process.stdout.write.bind(process.stdout)
const originalStderrWrite = process.stderr.write.bind(process.stderr) as WriteStream['write']

const createMemoryStorage = () => {
    const store = new Map<string, string>()

    return {
        get length() {
            return store.size
        },
        clear: () => {
            store.clear()
        },
        getItem: (key: string) => store.get(key) ?? null,
        key: (index: number) => Array.from(store.keys())[index] ?? null,
        removeItem: (key: string) => {
            store.delete(key)
        },
        setItem: (key: string, value: string) => {
            store.set(key, String(value))
        },
    }
}

const createMockLocation = (initialHref: string) => {
    let currentUrl = new URL(initialHref)

    const updateUrl = (value: string | URL) => {
        currentUrl = new URL(String(value), currentUrl.href)
    }

    return {
        get href() {
            return currentUrl.href
        },
        set href(value: string) {
            updateUrl(value)
        },
        get origin() {
            return currentUrl.origin
        },
        get protocol() {
            return currentUrl.protocol
        },
        get host() {
            return currentUrl.host
        },
        get hostname() {
            return currentUrl.hostname
        },
        get port() {
            return currentUrl.port
        },
        get pathname() {
            return currentUrl.pathname
        },
        get search() {
            return currentUrl.search
        },
        get hash() {
            return currentUrl.hash
        },
        assign: (value: string | URL) => {
            updateUrl(value)
        },
        replace: (value: string | URL) => {
            updateUrl(value)
        },
        reload: vi.fn(),
        toString: () => currentUrl.href,
    }
}

const shouldIgnoreTestNoise = (message: string) => {
    return [
        'MUI: The `anchorEl` prop provided to the component is invalid.',
        "Not implemented: Window's getComputedStyle() method: with pseudo-elements",
        'An update to',
        "was not wrapped in act(...)",
        "redux-persist localStorage test failed, persistence will be disabled.",
        'redux-persist failed to create sync storage. falling back to noop storage.',
        "[vitest] The vi.fn() mock did not use 'function' or 'class' in its implementation",
        'Warning: `--localstorage-file` was provided without a valid path',
        'Not implemented: navigation to another Document',
        'Recaptcha hatası:',
        'Bir hata oluştu:',
        'Session başarıyla yenilendi',
        'API 401 hatası alındı',
        'SirketPopup - Persisting selection for user',
        'SirketPopup - Persistence update successful.',
        'SirketPopup - Cookie session refreshed.',
        'SirketPopup - Rol güncellendi.',
        'SirketPopup - Persistence update hatası:',
    ].some((pattern) => message.includes(pattern))
}

beforeAll(() => {
    process.stdout.write = ((chunk: any, encoding?: any, callback?: any) => {
        const message = typeof chunk === 'string' ? chunk : String(chunk)
        if (shouldIgnoreTestNoise(message)) {
            if (typeof encoding === 'function') {
                encoding()
            } else if (typeof callback === 'function') {
                callback()
            }
            return true
        }

        return originalStdoutWrite(chunk, encoding, callback)
    }) as typeof process.stdout.write

    process.stderr.write = ((chunk: any, encoding?: any, callback?: any) => {
        const message = typeof chunk === 'string' ? chunk : String(chunk)
        if (shouldIgnoreTestNoise(message)) {
            if (typeof encoding === 'function') {
                encoding()
            } else if (typeof callback === 'function') {
                callback()
            }
            return true
        }

        return originalStderrWrite(chunk, encoding, callback)
    }) as typeof process.stderr.write

    vi.spyOn(console, 'log').mockImplementation((...args) => {
        const message = args.map(String).join(' ')
        if (shouldIgnoreTestNoise(message)) {
            return
        }

        originalConsoleLog(...args)
    })

    vi.spyOn(console, 'error').mockImplementation((...args) => {
        const message = args.map(String).join(' ')
        if (shouldIgnoreTestNoise(message)) {
            return
        }

        originalConsoleError(...args)
    })

    vi.spyOn(console, 'warn').mockImplementation((...args) => {
        const message = args.map(String).join(' ')
        if (shouldIgnoreTestNoise(message)) {
            return
        }

        originalConsoleWarn(...args)
    })

    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    })

    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
        configurable: true,
        value: vi.fn(),
    })

    Object.defineProperty(window.HTMLElement.prototype, 'getBoundingClientRect', {
        configurable: true,
        value: vi.fn(() => ({
            width: 120,
            height: 40,
            top: 0,
            left: 0,
            right: 120,
            bottom: 40,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        })),
    })

    Object.defineProperty(window, 'getComputedStyle', {
        configurable: true,
        value: vi.fn(() => ({
            getPropertyValue: vi.fn(() => ''),
        })),
    })

    if (typeof window.localStorage?.setItem !== 'function') {
        Object.defineProperty(window, 'localStorage', {
            configurable: true,
            value: createMemoryStorage(),
        })
    }

    if (typeof window.sessionStorage?.setItem !== 'function') {
        Object.defineProperty(window, 'sessionStorage', {
            configurable: true,
            value: createMemoryStorage(),
        })
    }

    Object.defineProperty(window, 'location', {
        configurable: true,
        value: createMockLocation(window.location?.href ?? 'http://localhost:3000/'),
    })
})

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup()
})

afterAll(() => {
    process.stdout.write = originalStdoutWrite as typeof process.stdout.write
    process.stderr.write = originalStderrWrite as typeof process.stderr.write
    vi.restoreAllMocks()
})
