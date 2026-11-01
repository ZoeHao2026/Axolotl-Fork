import assert from 'node:assert/strict'
import test from 'node:test'

import { CancelledError } from '@tanstack/vue-query'

import {
    AbstractWebNotificationManager,
    type NotificationPanelLocation,
    type WebNotification,
} from './web-notifications.ts'

class TestNotificationManager extends AbstractWebNotificationManager {
    readonly added: WebNotification[] = []

    getNotifications(): WebNotification[] {
        return this.added
    }

    getNotificationLocation(): NotificationPanelLocation {
        return 'right'
    }

    setNotificationLocation(_location: NotificationPanelLocation): void {
        // The notifications under test never move between panels.
    }

    // Notifications must not schedule auto-dismiss timers that keep the test
    // process alive.
    setNotificationTimer(): void {}

    protected addNotificationToStorage(notification: WebNotification): void {
        this.added.push(notification)
    }

    protected removeNotificationFromStorage(id: string | number): void {
        const index = this.added.findIndex((notification) => notification.id === id)
        if (index >= 0) this.added.splice(index, 1)
    }

    protected removeNotificationFromStorageByIndex(index: number): void {
        this.added.splice(index, 1)
    }

    protected clearAllNotificationsFromStorage(): void {
        this.added.splice(0)
    }
}

function createManager(): TestNotificationManager {
    return new TestNotificationManager()
}

test('handleError ignores a cancelled TanStack Query operation', () => {
    const manager = createManager()

    manager.handleError(new CancelledError())

    assert.equal(manager.getNotifications().length, 0)
})

test('handleError ignores a user-cancelled install job', () => {
    const manager = createManager()

    // Message of the job's `InstallErrorView`; see
    // packages/app-lib/src/install/runner.rs and
    // apps/app-frontend/src/helpers/install.ts.
    manager.handleError(new Error('Install was canceled'))
    // Fallback used by `settleInstallJob` when the job has no error view.
    manager.handleError(new Error('Install job 6f1e7a9c-3b2d-4c5e-8a1b-0d2e3f4a5b6c canceled'))

    assert.equal(manager.getNotifications().length, 0)
})

test('handleError ignores cancellation surfaces serialized by the Tauri boundary', () => {
    const manager = createManager()

    // `TheseusSerializableError::SearchCancelled`, see apps/app/src/api/mod.rs.
    manager.handleError({
        field_name: 'SearchCancelled',
        message: 'Search request cancelled: search-request-1',
    })
    // `ResourceError::Canceled`, serialized as the `Resource` variant.
    manager.handleError({
        field_name: 'Resource',
        message: 'resource request canceled',
        code: 'resourceError',
    })

    assert.equal(manager.getNotifications().length, 0)
})

test('handleError ignores an aborted operation', () => {
    const manager = createManager()

    manager.handleError(
        Object.assign(new Error('The operation was aborted'), { name: 'AbortError' }),
    )

    assert.equal(manager.getNotifications().length, 0)
})

test('handleError still reports real failures', () => {
    const manager = createManager()

    manager.handleError(new Error('Network request failed'))

    assert.equal(manager.getNotifications().length, 1)
    const [notification] = manager.getNotifications()
    assert.equal(notification.type, 'error')
    assert.equal(notification.text, 'Network request failed')
})

test('handleError does not hide failures whose text merely mentions cancellation', () => {
    const manager = createManager()

    // A rejected retry, not a cancellation; see
    // packages/app-lib/src/install/runner.rs.
    manager.handleError({
        field_name: 'Theseus',
        message: 'Only failed, interrupted, or canceled downloads can be retried',
    })

    assert.equal(manager.getNotifications().length, 1)
})

test('handleError keeps reporting non-cancellation resource failures', () => {
    const manager = createManager()

    manager.handleError({
        field_name: 'Resource',
        message: 'resource cursor expired; restart the query',
        code: 'cursorExpired',
    })

    assert.equal(manager.getNotifications().length, 1)
})
