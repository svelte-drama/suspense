<script lang="ts">
import { onDestroy, tick } from 'svelte'
import debounce from '$lib/_debounce'
import { setSuspenseListContext, type RegisterFunction } from './context'
import { STATUS } from './status'

interface Props {
  collapse?: boolean
  final?: boolean
  children?: import('svelte').Snippet<[boolean]>
  onload?: (element: HTMLElement) => void
}

let { collapse = false, final = false, children, onload }: Props = $props()

let element: HTMLElement | undefined = $state()
let destroyed = false

let watching: { loaded: boolean }[] = $state([])
let loading_index = $derived.by(() => {
  const index = watching.findIndex((v) => !v.loaded)
  return index === -1 ? watching.length : index
})
const loaded = $derived(loading_index === watching.length)
const loaded_item = $state({ loaded: true })

onDestroy(() => {
  destroyed = true
})

// Debounce to prevent dispatching multiple events when requests are chained.
const dispatchLoaded = debounce(() => {
  if (loaded && element) {
    onload?.(element)
  }
})
$effect(() => {
  if (onload && loaded) dispatchLoaded()
})

const register = ((data) => {
  let has_been_shown = false

  const index = watching.length
  watching[index] = data

  onDestroy(() => {
    if (destroyed) return
    watching[index] = loaded_item
  })

  const child_status = $derived.by(() => {
    if (has_been_shown) {
      return STATUS.READY
    }
    if (loading_index > index) {
      if (final && !has_been_shown) {
        tick().then(() => {
          if (data.loaded && loading_index > index) {
            has_been_shown = true
            watching[index] = loaded_item
          }
        })
      }
      return STATUS.READY
    }
    if (loading_index === index) {
      return STATUS.LOADING
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
  {@render children?.(!loaded)}
</div>

<style>
div {
  display: contents;
}
</style>
