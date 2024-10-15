<script lang="ts">
import { onDestroy } from 'svelte'
import debounce from '$lib/_debounce'
import { setSuspenseListContext, type RegisterFunction } from './context'
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

let status = $state<{
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
    status = {
      loaded: new Set(elements),
      next: null,
    }
  } else {
    loading = true
    status = {
      loaded: new Set(elements.slice(0, index)),
      next: elements[index],
    }
  }
})

let debounced_loading = $state(false)
const updateIsLoading = debounce((loading: boolean) => {
  debounced_loading = loading
  if (!loading && element) {
    onload?.(element)
  }
})
$effect(() => {
  updateIsLoading(loading)
})

const register = ((data) => {
  let child_has_been_shown = false
  let registered = false
  loading = true

  const { element, loaded } = $derived(data)
  $effect(() => {
    if (element) {
      if (!registered) {
        registered = true
        elements = undefined
      }
      watching.set(element, loaded)
      updateNext()
    }
  })

  onDestroy(() => {
    if (element && !destroyed) {
      watching.delete(element)
      elements = undefined
      updateNext()
    }
  })

  const child_status = $derived.by(() => {
    if (!element) {
      return STATUS.LOADING
    }
    if (final && child_has_been_shown) {
      return STATUS.READY
    }
    if (status.next === element) {
      return STATUS.LOADING
    }
    if (status.loaded.has(element)) {
      child_has_been_shown = true
      return STATUS.READY
    }
    return collapse ? STATUS.HIDDEN : STATUS.LOADING
  })

  return {
    get status() {
      return child_status
    },
  }
}) satisfies RegisterFunction
setSuspenseListContext(register)
</script>

<div bind:this={element}>
  {@render children?.(debounced_loading)}
</div>

<style>
div {
  display: contents;
}
</style>
