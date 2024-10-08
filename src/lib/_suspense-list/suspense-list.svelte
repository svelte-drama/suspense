<script lang="ts">
import { onDestroy } from 'svelte'
import { derived, writable } from 'svelte/store'
import type { Readable } from 'svelte/store'
import debounce from '$lib/_debounce'
import { setContext } from './context'
import { STATUS } from './status'
import { sortOnDocumentOrder } from './util'

interface Props {
  collapse?: boolean
  final?: boolean
  children?: import('svelte').Snippet<[boolean]>
  onload?: (element: HTMLElement) => void
}

let { collapse = false, final = false, children, onload }: Props = $props()

let element: HTMLElement | undefined = $state()
let elements: HTMLElement[] | undefined
let destroyed = false
let loading = $state(false)
const watching = new Map<HTMLElement, boolean>()

onDestroy(() => {
  destroyed = true
  watching.clear()
})

const status = writable<{
  loaded: Set<HTMLElement>
  next: HTMLElement | null
}>({
  loaded: new Set(),
  next: null,
})

const updateNext = debounce(() => {
  if (!elements) {
    elements = [...watching.keys()].sort(sortOnDocumentOrder)
  }

  const index = elements.findIndex((i) => !watching.get(i))

  if (index === -1) {
    loading = false
    status.set({
      loaded: new Set(elements),
      next: null,
    })
  } else {
    loading = true
    status.set({
      loaded: new Set(elements.slice(0, index)),
      next: elements[index],
    })
  }
})

const isLoading = writable(false)
const updateIsLoading = debounce((loading: boolean) => {
  isLoading.set(loading)
  if (!loading && element) {
    onload?.(element)
  }
})
$effect(() => {
  updateIsLoading(loading)
})

setContext(register)
function register(
  element: HTMLElement,
  loaded: Readable<boolean>
): Readable<STATUS> {
  let child_has_been_shown = false
  let registered = false
  loading = true

  const unsubscribe = loaded.subscribe((loaded) => {
    if (!registered) {
      registered = true
      elements = undefined
    }
    watching.set(element, loaded)
    updateNext()
  })

  onDestroy(() => {
    unsubscribe()

    if (!destroyed) {
      watching.delete(element)
      elements = undefined
      updateNext()
    }
  })

  return derived(status, ($status) => {
    if (final && child_has_been_shown) {
      return STATUS.READY
    } else if ($status.next === element) {
      return STATUS.LOADING
    } else if ($status.loaded.has(element)) {
      child_has_been_shown = true
      return STATUS.READY
    } else {
      return collapse ? STATUS.HIDDEN : STATUS.LOADING
    }
  })
}
</script>

<div bind:this={element}>
  {@render children?.($isLoading)}
</div>

<style>
div {
  display: contents;
}
</style>
