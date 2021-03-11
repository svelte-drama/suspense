<script context="module">
import { getContext } from 'svelte'

const CONTEXT = '7ty_suspense'

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

let state = INIT
let pending = 0

updateState()

function suspend (promise) {
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

  function reject () {
    if (once) {
      once = false
      pending -= 1
      state = ERROR
    }
  }

  if (promise) {
    return promise
      .then(value => {
        resolve()
        return value
      })
      .catch(error => {
        reject()
        throw error
      })
  } else {
    return { resolve, reject }
  }
}

function updateState () {
  if (state == ERROR) return

  function update() {
    if (state === ERROR) return
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
  <slot name="error"></slot>
{/if}

<div hidden={ state !== READY }>
  <slot></slot>
</div>
