import { describe, expect, it, vi } from 'vitest'

import { type SkinExportIo, type SkinExportReporter, writeExportedSkin } from './export-skin'

const request = {
    requestId: 'request-1',
    name: 'my skin',
    dataUrl: 'data:image/png;base64,iVBORw0KGgo=',
}

function recorder() {
    const events: [string, boolean][] = []
    const reporter: SkinExportReporter = {
        accepted: (accepted) => events.push(['accepted', accepted]),
        result: (saved) => events.push(['result', saved]),
    }
    return { reporter, events }
}

function io(overrides: Partial<SkinExportIo> = {}): SkinExportIo {
    return {
        choosePath: vi.fn(async () => '/tmp/my skin.png'),
        readDataUrl: vi.fn(async () => new Uint8Array([1, 2, 3])),
        writeFile: vi.fn(async () => {}),
        ...overrides,
    }
}

describe('writeExportedSkin', () => {
    it('reports success only after the file has been written', async () => {
        const order: string[] = []
        let finishWrite!: () => void
        const pendingWrite = new Promise<void>((resolve) => {
            finishWrite = resolve
        })
        const { reporter, events } = recorder()
        const written = io({
            writeFile: vi.fn(async () => {
                order.push('write')
                await pendingWrite
            }),
        })
        const reported: SkinExportReporter = {
            accepted: (accepted) => {
                order.push(`accepted:${accepted}`)
                reporter.accepted(accepted)
            },
            result: (saved) => {
                order.push(`result:${saved}`)
                reporter.result(saved)
            },
        }

        const exportPromise = writeExportedSkin(request, written, reported)
        await Promise.resolve()

        // The save dialog has not returned yet, so the editor must not be told
        // that the export succeeded (#877).
        expect(events).toEqual([])

        finishWrite()
        await expect(exportPromise).resolves.toBe(true)
        expect(order).toEqual(['write', 'accepted:true', 'result:true'])
        expect(written.choosePath).toHaveBeenCalledWith('my skin.png')
        expect(written.readDataUrl).toHaveBeenCalledWith(request.dataUrl)
        expect(written.writeFile).toHaveBeenCalledWith(
            '/tmp/my skin.png',
            new Uint8Array([1, 2, 3]),
        )
    })

    it('writes nothing and reports failure when the dialog is cancelled', async () => {
        const sideEffects = io({ choosePath: vi.fn(async () => null) })
        const { reporter, events } = recorder()

        await expect(writeExportedSkin(request, sideEffects, reporter)).resolves.toBe(false)

        expect(sideEffects.writeFile).not.toHaveBeenCalled()
        expect(sideEffects.readDataUrl).not.toHaveBeenCalled()
        expect(events).toEqual([
            ['accepted', false],
            ['result', false],
        ])
    })

    it('reports failure and rethrows when reading or writing the file fails', async () => {
        const failure = new Error('disk full')
        const sideEffects = io({
            writeFile: vi.fn(async () => {
                throw failure
            }),
        })
        const { reporter, events } = recorder()

        await expect(writeExportedSkin(request, sideEffects, reporter)).rejects.toBe(failure)

        expect(events).toEqual([
            ['accepted', false],
            ['result', false],
        ])
    })

    it('normalizes an export name without the png extension', async () => {
        const sideEffects = io()
        const { reporter } = recorder()

        await writeExportedSkin({ ...request, name: '  My Skin  ' }, sideEffects, reporter)

        expect(sideEffects.choosePath).toHaveBeenCalledWith('My Skin.png')
    })
})
