import { CancelledError } from '@tanstack/vue-query'

import { createContext } from './create-context.ts'

export interface WebNotification {
    id: string | number
    createdAt?: number
    title?: string
    text?: string
    type?: 'error' | 'warning' | 'success' | 'info'
    errorCode?: string
    count?: number
    autoCloseMs?: number | null // null means do not dismiss automatically
    timer?: NodeJS.Timeout
    /** Hidden from the toast stack but retained in notification history. */
    collapsed?: boolean
    /** Whether the user has opened this notification from the history. */
    read?: boolean
    supportData?: Record<string, unknown>
}

export type NotificationPanelLocation = 'left' | 'right'

/**
 * Cancelling or aborting work is a normal outcome of a user action or a
 * lifecycle change, not a failure worth an error notification.
 *
 * Axolotl reports cancellation through several surfaces: install jobs finish
 * with an `InstallErrorView` whose code is `canceled` and whose message is
 * `Install was canceled` (packages/app-lib/src/install/runner.rs), which
 * `wait_for_install_job` rethrows (apps/app-frontend/src/helpers/install.ts);
 * Tauri commands serialize `SearchCancelled` and `ResourceError::Canceled`
 * values (apps/app/src/api/mod.rs); and TanStack Query rejects with a
 * `CancelledError` when a query is cancelled mid-flight.
 */
export function isCancellationError(error: unknown): boolean {
    if (error instanceof CancelledError) return true
    if (error === null || typeof error !== 'object') {
        return typeof error === 'string' && isCanceledMessage(error)
    }

    const value = error as Record<string, unknown>
    if (value.code === 'canceled' || value.field_name === 'SearchCancelled') return true
    if (value.name === 'AbortError') return true

    const message = typeof value.message === 'string' ? value.message : value.error
    return typeof message === 'string' && isCanceledMessage(message)
}

const CANCELED_MESSAGES = new Set([
    // `InstallErrorView` for a user-cancelled install job
    'Install was canceled',
    // `ResourceError::Canceled`
    'resource request canceled',
])

function isCanceledMessage(message: string): boolean {
    return (
        CANCELED_MESSAGES.has(message) ||
        // Fallback of `settleInstallJob` when a canceled job has no error view
        /^Install job \S+ canceled$/.test(message) ||
        /^Search request cancelled: /.test(message)
    )
}

export abstract class AbstractWebNotificationManager {
    protected readonly DEFAULT_AUTO_DISMISS_DELAY_MS = 30 * 1000
    private lastGeneratedNotificationId = 0

    constructor() {
        this.addNotification = this.addNotification.bind(this)
        this.handleError = this.handleError.bind(this)
        this.removeNotification = this.removeNotification.bind(this)
        this.removeNotificationByIndex = this.removeNotificationByIndex.bind(this)
        this.clearAllNotifications = this.clearAllNotifications.bind(this)
        this.setNotificationTimer = this.setNotificationTimer.bind(this)
        this.collapseNotification = this.collapseNotification.bind(this)
        this.expandNotification = this.expandNotification.bind(this)
        this.markNotificationRead = this.markNotificationRead.bind(this)
        this.stopNotificationTimer = this.stopNotificationTimer.bind(this)
    }

    abstract getNotifications(): WebNotification[]
    abstract getNotificationLocation(): NotificationPanelLocation
    abstract setNotificationLocation(location: NotificationPanelLocation): void

    protected abstract addNotificationToStorage(notification: WebNotification): void
    protected abstract removeNotificationFromStorage(id: string | number): void
    protected abstract removeNotificationFromStorageByIndex(index: number): void
    protected abstract clearAllNotificationsFromStorage(): void

    addNotification(notification: Partial<WebNotification>): WebNotification {
        const existingNotif = this.findExistingNotification(notification)

        if (existingNotif) {
            existingNotif.createdAt = Date.now()
            existingNotif.collapsed = false
            existingNotif.read = false
            if (notification.errorCode !== undefined)
                existingNotif.errorCode = notification.errorCode
            if (notification.supportData !== undefined)
                existingNotif.supportData = notification.supportData
            this.refreshNotificationTimer(existingNotif)
            existingNotif.count = (existingNotif.count || 0) + 1
            return existingNotif
        }

        const newNotification = this.createNotification(notification)
        this.setNotificationTimer(newNotification)
        this.addNotificationToStorage(newNotification)
        return newNotification
    }

    public errorTitleProvider?: () => string
    /**
     * @deprecated You should use `addNotification` instead to provide a more human-readable error message to the user.
     */
    handleError(error: unknown): void {
        if (isCancellationError(error)) return

        this.addNotification({
            title: this.errorTitleProvider?.() ?? 'An error occurred',
            text:
                error instanceof Error
                    ? error.message
                    : typeof error === 'string'
                      ? error
                      : JSON.stringify(error),
            type: 'error',
        })
    }

    removeNotification(id: string | number): WebNotification | undefined {
        const notifications = this.getNotifications()
        const notification = notifications.find((n) => n.id === id)

        if (notification) {
            this.clearNotificationTimer(notification)
            this.removeNotificationFromStorage(id)
        }

        return notification
    }

    removeNotificationByIndex(index: number): WebNotification | null {
        const notifications = this.getNotifications()

        if (index >= 0 && index < notifications.length) {
            const notification = notifications[index]
            this.clearNotificationTimer(notification)
            this.removeNotificationFromStorageByIndex(index)

            return notification
        }

        return null
    }

    clearAllNotifications(): void {
        const notifications = this.getNotifications()
        notifications.forEach((notification) => {
            this.clearNotificationTimer(notification)
        })
        this.clearAllNotificationsFromStorage()
    }

    setNotificationTimer(notification: WebNotification): void {
        if (!notification) return

        this.clearNotificationTimer(notification)

        if (notification.autoCloseMs === null) return

        const delay = notification.autoCloseMs ?? this.DEFAULT_AUTO_DISMISS_DELAY_MS

        notification.timer = setTimeout(() => {
            this.collapseNotification(notification.id)
        }, delay)
    }

    collapseNotification(id: string | number): void {
        const notification = this.getNotifications().find((n) => n.id === id)
        if (notification) {
            this.clearNotificationTimer(notification)
            notification.collapsed = true
        }
    }

    expandNotification(id: string | number): void {
        const notification = this.getNotifications().find((n) => n.id === id)
        if (notification) {
            notification.collapsed = false
            this.setNotificationTimer(notification)
        }
    }

    markNotificationRead(id: string | number): void {
        const notification = this.getNotifications().find((n) => n.id === id)
        if (notification) notification.read = true
    }

    stopNotificationTimer(notification: WebNotification): void {
        this.clearNotificationTimer(notification)
    }

    private refreshNotificationTimer(notification: WebNotification): void {
        this.setNotificationTimer(notification)
    }

    private clearNotificationTimer(notification: WebNotification): void {
        if (notification.timer) {
            clearTimeout(notification.timer)
            notification.timer = undefined
        }
    }

    private findExistingNotification(
        notification: Partial<WebNotification>,
    ): WebNotification | undefined {
        return this.getNotifications().find(
            (existing) =>
                existing.text === notification.text &&
                existing.title === notification.title &&
                existing.type === notification.type &&
                existing.errorCode === notification.errorCode &&
                JSON.stringify(existing.supportData) === JSON.stringify(notification.supportData),
        )
    }

    private createNotification(notification: Partial<WebNotification>): WebNotification {
        // Notifications can be created in the same millisecond. Keep generated
        // ids unique so dismissing one item never targets its siblings.
        const now = Date.now()
        const id = Math.max(now, this.lastGeneratedNotificationId + 1)
        this.lastGeneratedNotificationId = id

        return {
            ...notification,
            id,
            createdAt: Date.now(),
            count: 1,
            read: false,
        } as WebNotification
    }
}

export const [injectNotificationManager, provideNotificationManager] =
    createContext<AbstractWebNotificationManager>('root', 'notificationManager')
