<script lang="ts">
import { derived as derivedStore, readable, type Readable } from 'svelte/store'
import debounce from '$lib/_debounce'
import {
  getSuspenseListContext,
  setSuspenseListContext,
} from '$lib/_suspense-list/context'
import { STATUS } from '$lib/_suspense-list/status'
import { createSuspense, setContext, type Suspend } from './context.svelte.js'
import { SvelteMap, SvelteSet } from 'svelte/reactivity'

interface Props {
  children?: import('svelte').Snippet<[Suspend]>
  error?: import('svelte').Snippet<[Error]>
  loading?: import('svelte').Snippet
  onerror?: (e: Error) => void
  onload?: (element: HTMLElement) => void
}

let {
  children,
  error: renderError,
  loading: renderLoading,
  onload,
  onerror,
}: Props = $props()

const isBrowser = typeof window !== 'undefined'

const errors = new SvelteMap<symbol, Error>()
const loading = new SvelteSet<symbol>()

const error = $derived.by<Error | undefined>(() => {
  if (errors.size) {
    return errors.entries().next().value
  }
})
const loaded = $derived(!loading.size)

// Debounce to prevent dispatching multiple events when requests are chained.
const dispatchLoaded = debounce(() => {
  if (loaded && element) {
    onload?.(element)
  }
})
$effect(() => {
  if (onload && loaded) dispatchLoaded()
})

$effect(() => {
  if (onerror && error) onerror(error)
})

let element: HTMLDivElement | undefined = $state()
const registerWithList = getSuspenseListContext()
setSuspenseListContext()

const list = registerWithList({
  get element() {
    return element
  },
  get loaded() {
    return loaded
  },
})

setContext({ promise: suspendPromise, store: suspendStore })
const suspend = createSuspense()

function suspendPromise<T>(promise: Promise<T>) {
  const index = Symbol()
  let aborted = false

  loading.add(index)

  promise
    .then(() => loading.delete(index))
    .catch((error: Error) => {
      if (!aborted) {
        errors.set(index, error)
        loading.delete(index)
      }
    })

  return () => {
    aborted = true
    errors.delete(index)
    loading.delete(index)
  }
}

function suspendStore<T>(
  store: Readable<T>,
  error?: Readable<Error | undefined>
) {
  const index = Symbol()

  const combined = derivedStore(
    [store, error ?? readable(undefined)],
    ([store, error]) => {
      if (store !== undefined) {
        errors.delete(index)
        loading.delete(index)
      } else if (error) {
        errors.set(index, error)
        loading.delete(index)
      } else {
        errors.delete(index)
        loading.add(index)
      }
    }
  )
  const unsub = combined.subscribe(() => {})

  return () => {
    unsub()
    errors.delete(index)
    loading.delete(index)
  }
}
</script>

{#if isBrowser}
  <div
    bind:this={element}
    hidden={!loaded || !!error || list.status !== STATUS.READY}
  >
    {@render children?.(suspend)}
  </div>
{/if}

{#if list.status === STATUS.HIDDEN}
  <!-- Hidden -->
{:else if error}
  {@render renderError?.(error)}
{:else if !loaded || list.status === STATUS.LOADING}
  {@render renderLoading?.()}
{/if}

<style>
div:not([hidden]) {
  display: contents;
}
</style>
