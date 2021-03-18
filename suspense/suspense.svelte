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
import { writable } from 'svelte/store'
import { CONTEXT as LIST_CONTEXT, STATUS as LIST_STATUS } from './suspense-list.svelte'
const dispatch = createEventDispatcher()

const STATUS = {
  INIT: 0,
  LOADING: 1,
  ERROR: 2,
  READY: 3
}

let error = null
let pending = 0
let state = STATUS.INIT // FIXME: This needs to set to LOADING for SSR

const register = getContext(LIST_CONTEXT)
const {
  onReady = () => {},
  status: list_status = writable(LIST_STATUS.READY)
} = register?.() ?? {}
setContext(LIST_CONTEXT)

setContext(CONTEXT, suspend)

updateState()

/* ----- */

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
      state = STATUS.ERROR
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
  if (state == STATUS.ERROR) return

  function update() {
    if (state === STATUS.ERROR) return
    if (pending) {
      state = STATUS.LOADING
    } else {
      // TODO: Should we allow components to go from READY to LOADING?
      // The UX is pretty awful on every example I've tried.
      state = STATUS.READY
      onReady()
      dispatch('load')
    }
  }

  if (typeof window.requestIdleCallback === 'function') {
    requestIdleCallback(update, {
      timeout: 50
    })
  } else {
    setTimeout(update, 10)
  }
}

function wait (timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout))
}
</script>

{#if state === STATUS.ERROR}
  <slot name="error" { error }></slot>
{:else if $list_status === LIST_STATUS.HIDDEN}
  <!-- Hidden -->
{:else if state === STATUS.LOADING || $list_status === LIST_STATUS.LOADING}
  <slot name="loading"></slot>
{/if}

<div hidden={ state !== STATUS.READY || $list_status !== LIST_STATUS.READY }>
  <slot { suspend }></slot>
</div>
