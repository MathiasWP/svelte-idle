<p align="center">
    <img width="100%" src="../media/banner.png" />
</p>

<h2 align="center">
Features | <a href="https://svelte.dev/repl/2556416ff1ef4788a6591823f953b276?version=3.46.4">Demo</a>
</h2>

<p align="center">
    No dependencies &mdash; TypeScript &mdash; SSR support &mdash; Readable store for idle value &mdash; <code>onIdle</code> callback
</p>

<h2 align="center">
Installation
</h2>

```bash
npm i svelte-idle -D
```

<h2 align="center">
Usage
</h2>

```svelte
<script>
import { listen, idle, onIdle } from 'svelte-idle'

// Run listen on component initialization
listen()

// Run code when the user idle via a callback...
onIdle(() => {
    console.log('User is idle')
})

//... or by using the idle store
$: {
    if($idle) console.log('User is idle')
}
</script>

User is idle: {$idle}
```

<h2 align="center">
API
</h2>

## listen
The listen method accepts an optional object (type: `SvelteIdleListenConfig`). The following values can be defined:

### timer
- type: `number`
- defines: amount of milliseconds until idle is true
- default: `60_000` (10 minutes)

### cycle
- type: `number`
- defines: amount of milliseconds before each idle-check
- default: `200`

#### Example:
```ts
import { listen } from 'svelte-idle'

listen({
    timer: 60_000,
    cycle: 500
})
```

## idle
A readable store that reflects the current idle-state.

## onIdle
Callback which will be fired everytime idle becomes true. Returns a method for clearing the listener.

#### Example:
```ts
import { onMount } from 'svelte'
import { onIdle } from 'svelte-idle'

onMount(() => {
    const unsub = onIdle(() => console.log('User is idle!'))
    return unsub
})
```
