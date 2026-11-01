/**
 * Whether the launcher can replace this installation itself.
 *
 * Package-manager-owned binaries (pacman, AUR, rpm/dnf, Nix) and development
 * builds are not artifacts the updater can swap out: handing their downloaded
 * file to the updater fails with "invalid updater binary format". Those installs
 * update through the package manager that owns them.
 *
 * An older backend does not report the flag, so only an explicit `false`
 * disables in-app updates.
 */
export function canLauncherInstallUpdate(installSupported: boolean | undefined): boolean {
    return installSupported !== false
}

export interface AppUpdateDownloadDecision {
    installSupported: boolean | undefined
    metered: boolean
}

/**
 * Whether an available update should be downloaded automatically.
 *
 * Background downloads are for unmetered connections, but they are pointless on
 * an installation the launcher cannot replace, where they would spend bandwidth
 * on an artifact the installer rejects.
 */
export function shouldAutoDownloadUpdate({
    installSupported,
    metered,
}: AppUpdateDownloadDecision): boolean {
    return canLauncherInstallUpdate(installSupported) && !metered
}

export interface PackageManagedHintDecision {
    /** Result of the last check; `null` before the user has checked. */
    checkResult: string | null
    installSupported: boolean | undefined
}

/**
 * Whether the update UI should explain that the package manager installs this
 * update instead of the launcher. The hint belongs next to an available update,
 * not next to an up-to-date or failed check.
 */
export function shouldExplainPackageManagedUpdate({
    checkResult,
    installSupported,
}: PackageManagedHintDecision): boolean {
    return checkResult === 'available' && !canLauncherInstallUpdate(installSupported)
}
