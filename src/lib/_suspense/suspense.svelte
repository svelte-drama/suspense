<script lang="ts">
import { derived as derivedStore, readable, type Readable } from 'svelte/store'
import debounce from '$lib/_debounce'
import {
  getSuspenseListContext,
  setSuspenseListContext,
} from '$lib/_suspense-list/context'
import { STATUS } from '$lib/_suspense-list/status'
import { createSuspense, setContext, type Suspend } from './context.svelte.js'

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

type SuspsendedRequest = {
  error?: Error
  loaded: boolean
}

const pending = new Map<symbol, SuspsendedRequest>()
function removePending(index: symbol) {
  if (pending.has(index)) {
    pending.delete(index)
    update()
  }
}
function updatePending(index: symbol, data: SuspsendedRequest) {
  pending.set(index, data)
  if (!data.loaded) loading = true
  update()
}

let loading = $state(false)
let error: Error | undefined = $state(undefined)

const update = debounce(() => {
  const values = Array.from(pending.values())
  loading = values.some(({ loaded }) => !loaded)
  error = values.find(({ error }) => error)?.error
})

// Debounce to prevent dispatching multiple events when requests are chained.
const dispatchLoaded = debounce(() => {
  if (!loading && element) {
    onload?.(element)
  }
})
$effect(() => {
  if (!loading) dispatchLoaded()
})

$effect(() => {
  if (onerror && error) onerror(error)
})

let element: HTMLDivElement | undefined = $state()
const registerWithList = getSuspenseListContext()
setSuspenseListContext()

let list = registerWithList({
  get element() {
    return element
  },
  get loaded() {
    return !loading
  },
})

setContext({ promise: suspendPromise, store: suspendStore })
const suspend = createSuspense()

function suspendPromise<T>(promise: Promise<T>) {
  const index = Symbol()
  let aborted = false

  updatePending(index, {
    loaded: false,
  })

  promise
    .then(() => removePending(index))
    .catch((error: Error) => {
      if (!aborted) {
        updatePending(index, {
          loaded: true,
          error,
        })
      }
    })

  return () => {
    removePending(index)
    aborted = true
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
        removePending(index)
      } else if (error) {
        updatePending(index, {
          loaded: true,
          error,
        })
      } else {
        updatePending(index, {
          loaded: false,
        })
      }
    }
  )
  const unsub = combined.subscribe(() => {})

  return () => {
    unsub()
    removePending(index)
  }
}
</script>

{#if isBrowser}
  <div
    bind:this={element}
    hidden={!!error || loading || list?.status !== STATUS.READY}
  >
    {@render children?.(suspend)}
  </div>
{/if}

{#if list?.status === STATUS.HIDDEN}
  <!-- Hidden -->
{:else if error}
  {@render renderError?.(error)}
{:else if loading || list?.status === STATUS.LOADING}
  {@render renderLoading?.()}
{/if}

<style>
div:not([hidden]) {
  display: contents;
}
</style>
