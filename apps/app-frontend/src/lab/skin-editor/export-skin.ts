import { normalizeExportFilename } from './session'

export interface SkinExportRequest {
    requestId: string
    name: string
    dataUrl: string
}

/** Side effects of one export, injected so the dialog/write ordering is testable. */
export interface SkinExportIo {
    /** Resolves the destination path, or `null` when the user cancels the dialog. */
    choosePath(defaultName: string): Promise<string | null>
    readDataUrl(dataUrl: string): Promise<Uint8Array>
    writeFile(path: string, data: Uint8Array): Promise<void>
}

export interface SkinExportReporter {
    /** `accepted` drives the editor's success state, so it must only be `true` after a real write. */
    accepted(accepted: boolean): void
    result(saved: boolean): void
}

/**
 * Saves the skin the embedded editor exported.
 *
 * The editor marks the export as successful as soon as it receives
 * `accepted: true`, so that message may only follow a completed write: sending
 * it before the save dialog returned marked cancelled or failed saves as
 * written (#877). Cancellation and failures therefore report `accepted: false`
 * and `result(saved: false)` together.
 */
export async function writeExportedSkin(
    request: SkinExportRequest,
    io: SkinExportIo,
    report: SkinExportReporter,
): Promise<boolean> {
    try {
        const path = await io.choosePath(normalizeExportFilename(request.name))
        if (!path) {
            report.accepted(false)
            report.result(false)
            return false
        }

        const data = await io.readDataUrl(request.dataUrl)
        await io.writeFile(path, data)

        report.accepted(true)
        report.result(true)
        return true
    } catch (error) {
        report.accepted(false)
        report.result(false)
        throw error
    }
}
