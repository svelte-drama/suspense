<script context="module">
export const CONTEXT = {}

export const STATUS = {
  READY: 0,
  LOADING: 1,
  HIDDEN: 2
}
</script>

<script>
import { createEventDispatcher, setContext } from 'svelte'
import { derived, writable } from 'svelte/store'
const dispatch = createEventDispatcher()

export let collapse = false
let count = 0
let loaded = new Set([])
let last_loaded = writable(0)

setContext(CONTEXT, register)

/* ----- */

function register () {
  const index = ++count

  const onReady = function () {
    loaded.add(index)
    last_loaded.update(last => {
      let i
      for (i = last; i <= count; i++) {
        if (!loaded.has(i + 1)) {
          break;
        }
      }

      if (i === count) {
        dispatch('load')
      }

      return i
    })
  }

  const status = derived(last_loaded, last => {
    if (index <= last) return STATUS.READY
    if (index === last + 1) return STATUS.LOADING
    return (collapse ? STATUS.HIDDEN : STATUS.LOADING)
  })

  return { status, onReady }
}
</script>

<slot></slot>
