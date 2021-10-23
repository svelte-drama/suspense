<script lang="ts">
import { createEventDispatcher } from 'svelte'
import { derived, writable } from 'svelte/store'
import debounce from './debounce'
import { setContext } from './suspense-list-context'
import * as STATUS from './suspense-list-status'

export let collapse = false

const dispatch = createEventDispatcher()
const dispatchLoad = debounce(() => {
  if ($next === $children.length) {
    dispatch('load')
  }
})

const children = writable([] as boolean[])
const next = derived(children, ($children) => {
  const index = $children.findIndex((i) => !i)
  if (index === -1) {
    dispatchLoad()
    return $children.length
  } else {
    return index
  }
})

setContext(register)
function register() {
  const index = $children.length
  $children[index] = false

  function update(loaded: boolean) {
    // Avoid unnecessary updates
    if ($children[index] !== loaded) {
      $children[index] = loaded
    }
  }

  const status = derived(next, ($next) => {
    if (index < $next) return STATUS.READY
    if (index === $next) return STATUS.LOADING
    return collapse ? STATUS.HIDDEN : STATUS.LOADING
  })

  return {
    status,
    update,
  }
}
</script>

<slot />
