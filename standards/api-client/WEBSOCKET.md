# API Client WebSocket

WebSocket support is attached to `client.archon.sockets`, and only on `GenericModrinthClient`. It provides event-based communication with Modrinth Hosting servers.

## Connection flow

```
client.archon.sockets.safeConnect(serverId)
  → fetches JWT auth via archon.servers_v0.getWebSocketAuth()
  → opens wss:// connection
  → sends { event: 'auth', jwt: token }
  → server responds with { event: 'auth-ok' }
  → ready to receive events
```

Auto-reconnects on unexpected disconnection with exponential backoff (base 1s, max 30s, up to 10 attempts).

## Subscribing to events

```ts
const unsub = client.archon.sockets.on(serverId, 'stats', (data) => {
  // data is typed as Archon.Websocket.v0.WSStatsEvent
  cpuUsage.value = data.cpu_percent
})

// Clean up
onUnmounted(() => {
  unsub()
  client.archon.sockets.disconnect(serverId)
})
```

Event types: `log`, `stats`, `power-state`, `uptime`, `backup-progress`, `installation-result`, `filesystem-ops`, `new-mod`, `auth-expiring`, `auth-incorrect`, `auth-ok`.

## Sending commands

```ts
client.archon.sockets.send(serverId, { event: 'command', cmd: '/say hello' })
```

See [the WebSocket implementation](../../packages/api-client/src/core/abstract-websocket.ts) for current subscription and reconnect behavior. The old desktop hosting route has been removed.
