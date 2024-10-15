<script lang="ts">
import {
  derived as derivedStore,
  readable,
  writable,
  type Readable,
} from 'svelte/store'
import debounce from '$lib/_debounce'
import {
  getContext as getListContext,
  setContext as setListContext,
  type SuspenseListContext,
} from '$lib/_suspense-list/context'
import { STATUS } from '$lib/_suspense-list/status'
import { setContext, type Suspend } from './context.js'

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
const registerWithList = getListContext()
setListContext()
const isLoaded = writable(true)
$effect(() => {
  $isLoaded = !loading
})

let list = $state<SuspenseListContext | undefined>()
$effect(() => {
  if (element) {
    list = registerWithList(element, isLoaded)
  }
})

function suspend<T>(promise: Promise<T>): Promise<T>
function suspend<T>(
  store: Readable<T>,
  error?: Readable<Error | undefined>
): Readable<T>
function suspend<T>(
  data: Promise<T> | Readable<T>,
  error?: Readable<Error | undefined>
) {
  if ('subscribe' in data) {
    return suspendStore(data, error)
  } else {
    return suspendPromise(data)
  }
}
suspend.all = ((...args) => {
  return suspend(Promise.all(args))
}) satisfies Suspend['all']
setContext(suspend)

function suspendPromise<T>(promise: Promise<T>): Promise<T> {
  $effect(() => {
    const index = Symbol()
    let aborted = false

    updatePending(index, {
      loaded: false,
    })

    promise
      .then(() => {
        removePending(index)
      })
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
  })

  return promise
}

function suspendStore<T>(
  store: Readable<T>,
  error?: Readable<Error | undefined>
) {
  error = error ?? readable(undefined)
  $effect(() => {
    const index = Symbol()

    const combined = derivedStore([store, error], ([store, error]) => {
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
    })
    return combined.subscribe(() => {})
  })

  return store
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
