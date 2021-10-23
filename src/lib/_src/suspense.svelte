<script lang="ts">
import debounce from './debounce'
import { createEventDispatcher } from 'svelte'
import { derived, writable, readable } from 'svelte/store'
import type { Readable, Writable } from 'svelte/store'

import { setContext } from './suspense-context'
import {
  getContext as getListContext,
  setContext as setListContext,
} from './suspense-list-context'
import * as LIST_STATUS from './suspense-list-status'

const dispatch = createEventDispatcher()
const isBrowser = typeof window !== 'undefined'

const { isReady: listState, onFinished } = getListContext()
setListContext()

type Pending = {
  error?: Error
  loaded?: boolean
}
let pending: Readable<Pending>[] = []
$: pendingValues = derived(pending, ($pending) => $pending)

$: error = $pendingValues.find((item) => item.error)?.error
$: error && dispatch('error', error)

// Debounce to prevent dispatching multiple events when
// requests are chained.
const dispatchLoaded = debounce(() => {
  if (!loading && !error) {
    dispatch('load')
    onFinished()
  }
})
$: loading = !isBrowser || $pendingValues.some((item) => !item.loaded)
$: !loading && dispatchLoaded()

setContext(suspend)

export function suspend<T>(
  data: Readable<T | undefined>,
  error?: Readable<Error | undefined>
): Readable<T | undefined>
function suspend<T>(data: Promise<T>): Promise<T>
function suspend<T>(
  data: Readable<T | undefined> | Promise<T>,
  error?: Readable<Error | undefined>
) {
  if ('subscribe' in data) {
    error = error || readable(undefined)
    return suspendStore(data, error)
  } else {
    return suspendPromise(data)
  }
}

function suspendStore<T>(
  data_store: Readable<T | undefined>,
  error_store: Readable<Error | undefined>
) {
  const store = derived([data_store, error_store], ([data, error]) => ({
    error: data !== undefined && error,
    loaded: data !== undefined,
  }))
  pending.push(store)
  pending = pending
  return data_store
}

function suspendPromise<T>(promise: Promise<T>) {
  const store: Writable<Pending> = writable({})
  promise
    .then(() => store.set({ loaded: true }))
    .catch((error: Error) => store.set({ error }))
  pending.push(store)
  pending = pending
  return promise
}
</script>

{#if $listState === LIST_STATUS.HIDDEN}
  <!-- Hidden -->
{:else if error}
  <slot name="error" {error} />
{:else if loading || $listState === LIST_STATUS.LOADING}
  <slot name="loading" />
{/if}

{#if isBrowser}
  <div hidden={!!error || loading || $listState !== LIST_STATUS.READY}>
    <slot {suspend} />
  </div>
{/if}

<style>
div:not([hidden]) {
  display: contents;
}
</style>
