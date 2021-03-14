<script context="module">
import { getContext } from 'svelte'

const CONTEXT = {}

export function createSuspense() {
  function suspend (promise) {
    if (promise) return promise

    return {
      resolve: () => {},
      reject: () => {}
    }
  }

  return getContext(CONTEXT) || suspend
}
</script>

<script>
import { setContext } from 'svelte'

const INIT = 0
const LOADING = 1
const ERROR = 2
const READY = 3

let error = null
let state = INIT // FIXME: This needs to set to LOADING for SSR
let pending = 0

updateState()

export function suspend (promise = undefined) {
  let once = true
  pending += 1
  updateState()

  function resolve () {
    if (once) {
      once = false
      pending -= 1
      updateState()
    }
  }

  function reject (err) {
    if (once) {
      once = false
      error = err
      pending -= 1
      state = ERROR
    }
  }

  if (promise === undefined) {
    return { resolve, reject }
  }

  return (async function () {
    try {
      const result = await promise
      resolve()
      return result
    } catch (e) {
      reject(e)
      throw e
    }
  })()
}

function updateState () {
  if (state == ERROR) return

  function update() {
    if (state === ERROR) return
    // TODO: Should we allow components to go from READY to LOADING?
    // The UX is pretty awful on every example I've tried.
    state = pending ? LOADING : READY
  }

  if (pending) {
    wait(300).then(update)
  } else {
    wait(100).then(update)
  }
}

function wait (timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout))
}

setContext(CONTEXT, suspend)
</script>

{#if state === LOADING}
  <slot name="loading"></slot>
{:else if state === ERROR}
  <slot name="error" { error }></slot>
{/if}

<div hidden={ state !== READY }>
  <slot { suspend }></slot>
</div>
