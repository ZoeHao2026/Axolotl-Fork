import { describe, expect, it } from 'vitest'

import { errorMessage, errorText } from './error-text'

describe('errorMessage', () => {
    it('reads the message out of a serialized Tauri error', () => {
        expect(errorText({ field_name: 'Theseus', message: 'cache unavailable' })).toBe(
            'cache unavailable',
        )
        expect(errorMessage({ field_name: 'Theseus', message: 'cache unavailable' })).toBe(
            'cache unavailable',
        )
    })

    it('reads native Error instances', () => {
        expect(errorMessage(new Error('cache unavailable'))).toBe('cache unavailable')
    })

    it('returns null instead of "undefined" when the value has no string message', () => {
        expect(errorMessage({ field_name: 'Theseus' })).toBeNull()
        expect(errorMessage({ message: 42 })).toBeNull()
        expect(errorMessage({ message: null })).toBeNull()
        expect(errorMessage('plain text')).toBeNull()
        expect(errorMessage(null)).toBeNull()
        expect(errorMessage(undefined)).toBeNull()
    })

    it('never throws on a value that cannot be inspected', () => {
        // A rejected IPC value is normally a plain object, but this helper runs
        // inside catch blocks: throwing again there would hide the original
        // failure.
        const hostile = new Proxy(
            {},
            {
                has() {
                    throw new Error('has trap')
                },
                get() {
                    throw new Error('get trap')
                },
                getPrototypeOf() {
                    throw new Error('getPrototypeOf trap')
                },
            },
        )
        expect(errorMessage(hostile)).toBeNull()
        expect(errorText(hostile)).toBeNull()
    })
})

describe('errorText', () => {
    it('prefers the message of a serialized Tauri error', () => {
        expect(errorText({ field_name: 'Theseus', message: 'RedStone operation cancelled' })).toBe(
            'RedStone operation cancelled',
        )
    })

    it('formats objects without a message as JSON instead of [object Object]', () => {
        // `String()` on a plain object is the bug behind issue #834.
        expect(errorText({ field_name: 'Theseus' })).toBe('{"field_name":"Theseus"}')
    })

    it('formats primitives', () => {
        expect(errorText('cache unavailable')).toBe('cache unavailable')
        expect(errorText(42)).toBe('42')
        expect(errorText(false)).toBe('false')
    })

    it('returns null when there is nothing readable', () => {
        expect(errorText(null)).toBeNull()
        expect(errorText(undefined)).toBeNull()

        const circular: Record<string, unknown> = {}
        circular.self = circular
        expect(errorText(circular)).toBeNull()
    })
})
