import { describe, expect, it } from 'vitest'

import {
    canLauncherInstallUpdate,
    shouldAutoDownloadUpdate,
    shouldExplainPackageManagedUpdate,
} from './app-update'

describe('canLauncherInstallUpdate', () => {
    it('only treats an explicit false as a package-managed install', () => {
        expect(canLauncherInstallUpdate(true)).toBe(true)
        expect(canLauncherInstallUpdate(false)).toBe(false)
        // Older backends do not send the flag; do not disable updates for them.
        expect(canLauncherInstallUpdate(undefined)).toBe(true)
    })
})

describe('shouldAutoDownloadUpdate', () => {
    it('downloads automatically on an unmetered connection it can install itself', () => {
        expect(shouldAutoDownloadUpdate({ installSupported: true, metered: false })).toBe(true)
    })

    it('does not download automatically on a metered connection', () => {
        expect(shouldAutoDownloadUpdate({ installSupported: true, metered: true })).toBe(false)
    })

    it('does not download automatically when the installation is package-managed', () => {
        expect(shouldAutoDownloadUpdate({ installSupported: false, metered: false })).toBe(false)
        expect(shouldAutoDownloadUpdate({ installSupported: false, metered: true })).toBe(false)
    })

    it('keeps the previous behavior for backends that do not report support', () => {
        expect(shouldAutoDownloadUpdate({ installSupported: undefined, metered: false })).toBe(true)
        expect(shouldAutoDownloadUpdate({ installSupported: undefined, metered: true })).toBe(false)
    })
})

describe('shouldExplainPackageManagedUpdate', () => {
    it('explains a package-managed install next to an available update', () => {
        expect(
            shouldExplainPackageManagedUpdate({
                checkResult: 'available',
                installSupported: false,
            }),
        ).toBe(true)
    })

    it('does not explain when the launcher can install the update', () => {
        expect(
            shouldExplainPackageManagedUpdate({ checkResult: 'available', installSupported: true }),
        ).toBe(false)
        expect(
            shouldExplainPackageManagedUpdate({
                checkResult: 'available',
                installSupported: undefined,
            }),
        ).toBe(false)
    })

    it('does not explain next to other check results', () => {
        for (const checkResult of ['up-to-date', 'offline', 'paused', 'disabled', 'failed', null]) {
            expect(
                shouldExplainPackageManagedUpdate({ checkResult, installSupported: false }),
            ).toBe(false)
        }
    })
})
