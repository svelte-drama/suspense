<script lang="ts">
import debounce from '$lib/_debounce'
import { createEventDispatcher } from 'svelte'
import { derived, writable, readable } from 'svelte/store'
import type { Readable, Writable } from 'svelte/store'

import { setContext } from './context'
import {
  getContext as getListContext,
  setContext as setListContext,
} from '$lib/_suspense-list/context'
import * as LIST_STATUS from '$lib/_suspense-list/status'

const dispatch = createEventDispatcher()
const isBrowser = typeof window !== 'undefined'

const { status: listStatus, update: listUpdate } = getListContext()
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
    listUpdate(true)
  }
})
$: loading = !isBrowser || $pendingValues.some((item) => !item.loaded)
$: loading ? listUpdate(false) : dispatchLoaded()

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

{#if $listStatus === LIST_STATUS.HIDDEN}
  <!-- Hidden -->
{:else if error}
  <slot name="error" {error} />
{:else if loading || $listStatus === LIST_STATUS.LOADING}
  <slot name="loading" />
{/if}

{#if isBrowser}
  <div hidden={!!error || loading || $listStatus !== LIST_STATUS.READY}>
    <slot {suspend} />
  </div>
{/if}

<style>
div:not([hidden]) {
  display: contents;
}
</style>
