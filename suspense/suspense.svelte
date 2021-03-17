<script context="module">
import { getContext } from 'svelte'

const CONTEXT = {}

function dummy_suspend (promise) {
  if (promise) return promise

  return {
    resolve: () => {},
    reject: () => {}
  }
}

export function createSuspense() {
  return getContext(CONTEXT) || dummy_suspend
}
</script>

<script>
import { createEventDispatcher, setContext } from 'svelte'
const dispatch = createEventDispatcher()

const INIT = 0
const LOADING = 1
const ERROR = 2
const READY = 3

let error = null
let state = INIT // FIXME: This needs to set to LOADING for SSR
let pending = 0
export let timeout = 50

updateState()

export function suspend (promise = null, { timeout } = {}) {
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
      dispatch('error', e)
    }
  }

  if (!promise) {
    return { resolve, reject }
  }

  const condition = (timeout ?
    Promise.race([promise, wait(timeout)]) :
    promise
  )
  return condition
    .then(result => {
      resolve()
      return result
    })
    .catch(e => {
      reject(e)
      throw e
    })
}

function updateState () {
  if (state == ERROR) return

  function update() {
    if (state === ERROR) return
    if (pending) {
      state = LOADING
    } else {
      // TODO: Should we allow components to go from READY to LOADING?
      // The UX is pretty awful on every example I've tried.
      state = READY
      dispatch('load')
    }
  }

  if (pending) {
    wait(timeout).then(update)
  } else {
    wait(50).then(update)
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
