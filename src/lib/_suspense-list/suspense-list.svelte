<svelte:options immutable={true} />

<script lang="ts">
import { createEventDispatcher, onDestroy } from 'svelte'
import { derived, writable } from 'svelte/store'
import type { Readable } from 'svelte/store'
import debounce from '$lib/_debounce'
import { setContext } from './context'
import { STATUS } from './status'
import { sortOnDocumentOrder } from './util'

export let collapse = false
export let final = false

const dispatch = createEventDispatcher<{
  load: { element: HTMLElement }
}>()

let element: HTMLElement
const children = writable([] as HTMLElement[])
const status = new Map<HTMLElement, boolean>()

const next = writable<number | null>(null)
function updateNext() {
  const elem = $children.findIndex((i) => !status.get(i))
  next.set(elem === -1 ? null : elem)
}

const isLoading = writable(false)
const updateIsLoading = debounce((loading: boolean) => {
  isLoading.set(loading)
  if (!loading) {
    dispatch('load', { element })
  }
})
$: updateIsLoading($next !== null)

setContext(register)
function register(
  element: HTMLElement,
  loaded: Readable<boolean>
): Readable<STATUS> {
  let child_has_been_shown = false

  children.update(($children) => {
    const data = [...$children, element]
    return data.sort(sortOnDocumentOrder)
  })

  const unsubscribe = loaded.subscribe((loaded) => {
    status.set(element, loaded)
    updateNext()
  })

  onDestroy(() => {
    unsubscribe()
    status.delete(element)
    children.update(($children) => {
      return $children.filter((i) => i !== element)
    })
    updateNext()
  })

  return derived([next, children], ([$next, $children]) => {
    if (final && child_has_been_shown) {
      return STATUS.READY
    } else if ($next === null) {
      child_has_been_shown = true
      return STATUS.READY
    } else {
      const index = $children.findIndex((i) => i === element)
      if (index < $next) {
        child_has_been_shown = true
        return STATUS.READY
      } else if (index === $next) {
        return STATUS.LOADING
      } else {
        return collapse ? STATUS.HIDDEN : STATUS.LOADING
      }
    }
  })
}
</script>

<div bind:this={element}>
  <slot loading={$isLoading} />
</div>

<style>
div {
  display: contents;
}
</style>
