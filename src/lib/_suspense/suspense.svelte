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

let pending: boolean[] = []
let errors: (Error | undefined)[] = []
let subscriptions: (() => void)[] = []

onDestroy(() => {
  subscriptions.forEach((unsubscribe) => unsubscribe())
})

$: loading = pending.some((item) => !item)

// Debounce to prevent dispatching multiple events when requests are chained.
const dispatchLoaded = debounce(() => {
  if (!loading) {
    dispatch('load')
  }
})
$: !loading && dispatchLoaded()

$: error = errors.find((i) => i)
$: error && dispatch('error', error)

let element: HTMLDivElement
const registerWithList = getListContext()
setListContext()
const isLoaded = writable(true)
$: $isLoaded = !loading
$: listStatus = element && registerWithList(element, isLoaded)

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
  const index = pending.length

  const store = derived([data_store, error_store], ([data, error]) => ({
    error: data !== undefined ? undefined : error,
    loaded: data !== undefined,
  }))
  subscriptions.push(
    store.subscribe(({ error, loaded }) => {
      pending[index] = loaded
      errors[index] = error
    })
  )

  return data_store
}

function suspendPromise<T>(promise: Promise<T>) {
  const index = pending.length
  pending[index] = false
  errors[index] = undefined

  promise
    .then(() => {
      pending[index] = true
    })
    .catch((error: Error) => {
      errors[index] = error
    })

  return promise
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
