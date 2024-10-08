<script lang="ts">
import { onDestroy } from 'svelte'
import { writable } from 'svelte/store'
import debounce from '$lib/_debounce'
import {
  getContext as getListContext,
  setContext as setListContext,
  type SuspenseListContext,
} from '$lib/_suspense-list/context'
import { STATUS } from '$lib/_suspense-list/status'
import { setContext, type Suspend } from './context'

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
  loaded: boolean
  error: Error | undefined
  unsub: () => void
}

const pending = new Map<symbol, SuspsendedRequest>()
function removePending(index: symbol) {
  const data = pending.get(index)
  if (data) {
    pending.delete(index)
    data.unsub()
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

onDestroy(() => {
  pending.forEach(({ unsub }) => unsub())
  pending.clear()
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
  if (error) onerror?.(error)
})

let element: HTMLDivElement | undefined = $state()
const registerWithList = getListContext()
setListContext()
const isLoaded = writable(true)
$effect(() => {
  $isLoaded = !loading
})

let listStatus = $state<SuspenseListContext | undefined>()
$effect(() => {
  if (element) {
    listStatus = registerWithList(element, isLoaded)
  }
})

function internalSuspend<T>(data: Promise<T>): {
  abort: () => void
  result: Promise<T>
} {
  return suspendPromise(data)
}
setContext(internalSuspend)

function suspend<T>(data: Promise<T>): Promise<T> {
  const { result } = internalSuspend<T>(data)
  return result
}

function suspendPromise<T>(promise: Promise<T>) {
  const index = Symbol()
  let aborted = false

  const abort = () => {
    removePending(index)
    aborted = true
  }
  const unsub = () => {
    aborted = true
  }

  updatePending(index, {
    loaded: false,
    error: undefined,
    unsub,
  })

  const result = promise
    .then((data) => {
      removePending(index)
      return data
    })
    .catch((error: Error) => {
      if (!aborted) {
        updatePending(index, {
          loaded: true,
          error,
          unsub,
        })
      }
      throw error
    })

  return {
    abort,
    result,
  }
}
</script>

{#if isBrowser}
  <div
    bind:this={element}
    hidden={!!error || loading || $listStatus !== STATUS.READY}
  >
    {@render children?.(suspend)}
  </div>
{/if}

{#if $listStatus === STATUS.HIDDEN}
  <!-- Hidden -->
{:else if error}
  {@render renderError?.(error)}
{:else if loading || $listStatus === STATUS.LOADING}
  {@render renderLoading?.()}
{/if}

<style>
div:not([hidden]) {
  display: contents;
}
</style>
