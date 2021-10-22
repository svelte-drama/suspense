<script lang="ts">
import debounce from './debounce'
import { createEventDispatcher } from 'svelte'
import { derived, writable, readable } from 'svelte/store'
import type { Readable } from 'svelte/store'

import { setContext } from './suspense-context'
import {
  getContext as getListContext,
  setContext as setListContext,
  STATUS as LIST_STATUS,
} from './suspense-list-context'

const dispatch = createEventDispatcher()
const isBrowser = typeof window !== 'undefined'

const { isReady: listState, onFinished } = getListContext()
setListContext()

type PendingStore = Readable<{
  data?: unknown
  error?: Error
}>
let pending: PendingStore[] = []
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
$: loading = !isBrowser || $pendingValues.some((item) => !item.data)
$: !loading && !error && dispatchLoaded()

setContext(suspend)

function suspend<T>(
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
  const store = derived([data_store, error_store], ([data, error]) => {
    if (data !== undefined) {
      return { data }
    } else if (error) {
      return { error }
    } else {
      return {}
    }
  })
  pending.push(store)
  pending = pending
  return data_store
}

function suspendPromise<T>(promise: Promise<T>) {
  const store = writable({})
  promise
    .then((data) => store.set({ data }))
    .catch((error) => store.set({ error }))
  pending.push(store)
  pending = pending
  return promise
}
</script>

{#if error}
  {#if $listState !== LIST_STATUS.HIDDEN}
    <slot name="error" {error} />
  {/if}
{:else}
  {#if $listState === LIST_STATUS.HIDDEN}
    <!-- Hidden -->
  {:else if loading || $listState === LIST_STATUS.LOADING}
    <slot name="loading" />
  {/if}

  {#if isBrowser}
    <div hidden={loading || $listState !== LIST_STATUS.READY}>
      <slot {suspend} />
    </div>
  {/if}
{/if}

<style>
div:not([hidden]) {
  display: contents;
}
</style>
