<script lang="ts">
import debounce from '$lib/_debounce'
import { createEventDispatcher, onDestroy } from 'svelte'
import { derived, writable, readable } from 'svelte/store'
import type { Readable } from 'svelte/store'

import { setContext } from './context'
import {
  getContext as getListContext,
  setContext as setListContext,
} from '$lib/_suspense-list/context'
import * as LIST_STATUS from '$lib/_suspense-list/status'

const dispatch = createEventDispatcher()
const isBrowser = typeof window !== 'undefined'

type SuspsendedRequest = {
  loaded: boolean,
  error: Error | undefined,
  unsub: () => void
}

let pending = new Map<symbol, SuspsendedRequest>()
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
  update()
}

let loading = false
let error: Error | undefined = undefined

const update = debounce(() => {
  const values = Array.from(pending.values())
  loading = values.some(({ loaded }) => !loaded)
  error = values.find(({ error }) => error)?.error
})

onDestroy(() => {
  pending.forEach(({ unsub }) => unsub())
})

// Debounce to prevent dispatching multiple events when requests are chained.
const dispatchLoaded = debounce(() => {
  if (!loading) {
    dispatch('load')
  }
})
$: !loading && dispatchLoaded()

$: error && dispatch('error', error)

let element: HTMLDivElement
const registerWithList = getListContext()
setListContext()
const isLoaded = writable(true)
$: $isLoaded = !loading
$: listStatus = element && registerWithList(element, isLoaded)

function internalSuspend<T>(data: Readable<T | undefined> | Promise<T>, error?: Readable<Error | undefined>) {
  if ('subscribe' in data) {
    error = error || readable(undefined)
    return suspendStore(data, error)
  } else {
    return suspendPromise(data)
  }
}
setContext(internalSuspend)

function suspend<T extends Promise<unknown>>(data: T): T
export function suspend<T extends Readable<unknown>>(
  data: T,
  error?: Readable<Error | undefined>
): T
function suspend(
  data: Promise<unknown> | Readable<unknown>,
  error?: Readable<Error | undefined>
) {
  internalSuspend(data, error)
  return data
}

function suspendStore<T>(
  data_store: Readable<T | undefined>,
  error_store: Readable<Error | undefined>
) {
  const index = Symbol()

  const store = derived([data_store, error_store], ([data, error]) => ({
    error: data !== undefined ? undefined : error,
    loaded: data !== undefined,
  }))
  const unsub = store.subscribe(({ error, loaded }) => {
    updatePending(index, {
      loaded,
      error,
      unsub: () => unsub
    })
  })

  return unsub
}

function suspendPromise<T>(promise: Promise<T>) {
  const index = Symbol()
  let aborted = false

  const unsub = () => aborted = true

  updatePending(index, {
    loaded: false,
    error: undefined,
    unsub
  })

  promise
    .then(() => {
      removePending(index)
    })
    .catch((error: Error) => {
      if (aborted) return
      updatePending(index, {
        loaded: true,
        error,
        unsub
      })
    })

  return unsub
}
</script>

{#if isBrowser}
  <div
    bind:this={element}
    hidden={!!error || loading || $listStatus !== LIST_STATUS.READY}
  >
    <slot {suspend} />
  </div>
{/if}

{#if $listStatus === LIST_STATUS.HIDDEN}
  <!-- Hidden -->
{:else if error}
  <slot name="error" {error} />
{:else if loading || $listStatus === LIST_STATUS.LOADING}
  <slot name="loading" />
{/if}

<style>
div:not([hidden]) {
  display: contents;
}
</style>
