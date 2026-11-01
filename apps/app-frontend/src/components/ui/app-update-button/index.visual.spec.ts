import { mount } from '@vue/test-utils'
import { beforeEach, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import AppUpdateButton from './index.vue'

const updateState = vi.hoisted(() => ({
    availableUpdate: { value: null } as { value: { installSupported?: boolean } | null },
    metered: { value: false } as { value: boolean },
}))

vi.mock('@/providers/app-update', async () => {
    const { ref } = await import('vue')
    updateState.availableUpdate = ref(null)
    updateState.metered = ref(false)
    return {
        appUpdateState: {
            availableUpdate: updateState.availableUpdate,
            downloading: ref(false),
            downloadPercent: ref(0),
            downloadProgress: ref(0),
            finishedDownloading: ref(false),
            isVisible: ref(true),
            metered: updateState.metered,
            restarting: ref(false),
        },
        downloadAvailableAppUpdate: vi.fn(),
        installAvailableAppUpdate: vi.fn(),
    }
})

vi.mock('@modrinth/ui', async () => {
    const { defineComponent, h } = await import('vue')
    return {
        Button: defineComponent({
            setup:
                (_, { attrs, slots }) =>
                () =>
                    h('button', attrs, slots.default?.()),
        }),
        defineMessages: (messages: unknown) => messages,
        useVIntl: () => ({
            formatMessage: (message: { defaultMessage: string }) => message.defaultMessage,
        }),
    }
})

beforeEach(() => {
    updateState.availableUpdate.value = null
    updateState.metered.value = false
})

it('hides the placeholder update pill for a package-managed installation', async () => {
    // A package manager owns this install, so downloading the update here would
    // only produce an artifact the updater rejects (#970).
    updateState.metered.value = true
    updateState.availableUpdate.value = { installSupported: false }
    const wrapper = mount(AppUpdateButton, { global: { directives: { tooltip: () => {} } } })

    try {
        await nextTick()
        expect(wrapper.find('button').exists()).toBe(false)
    } finally {
        wrapper.unmount()
    }
})

it('offers the update when the launcher can install it itself', async () => {
    updateState.metered.value = true
    updateState.availableUpdate.value = { installSupported: true }
    const wrapper = mount(AppUpdateButton, { global: { directives: { tooltip: () => {} } } })

    try {
        await nextTick()
        expect(wrapper.get('button').text()).toContain('Update')
    } finally {
        wrapper.unmount()
    }
})
