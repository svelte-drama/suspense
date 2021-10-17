<script context="module">
import { getContext } from 'svelte'

const CONTEXT = {}

function dummy_suspend (promise) {
  if (promise) return promise

  return {
    resolve: () => {},
    reject: () => {}
  }
}

export function createSuspense() {
  return getContext(CONTEXT) || dummy_suspend
}
</script>

<script>
import { createEventDispatcher, setContext } from 'svelte'
import { readable } from 'svelte/store'
import { CONTEXT as LIST_CONTEXT, STATUS as LIST_STATUS } from './suspense-list.svelte'
const dispatch = createEventDispatcher()

const register = getContext(LIST_CONTEXT)
const {
  onReady = () => {},
  status: list_status = readable(LIST_STATUS.READY)
} = register?.() ?? {}
setContext(LIST_CONTEXT)

setContext(CONTEXT, suspend)

let error
let loading = false

// Debounce and give this a slight delay to account for
// new promises coming in as a result of old ones resolving.
const dispatchLoadEvent = debounce(() => {
  if (!loading) {
    onReady()
    dispatch('load')
  }
}, 5)

// Svelte stores track if they have any active subscribers.
// We'll take advantage of that logic, even though we never
// care about the actual value of this store.
const ref_count = readable(0, () => {
  loading = true
  return () => {
    loading = false
    dispatchLoadEvent()
  }
})

/* ----- */

function createPromise () {
  let resolve, reject
  const promise = new Promise((resolve_, reject_) => {
    resolve = resolve_
    reject = reject_
  })
  return { promise, resolve, reject }
}

function debounce (fn, time) {
	let timer

	return function (...args) {
		clearTimeout(timer)
		timer = setTimeout(() => fn(...args), time)
	}
}

function suspend (promise_like) {
  if (!promise_like) {
    const { promise, resolve, reject } = createPromise()
    suspend(promise)
    return { resolve, reject }
  }

  const unsubscribe = ref_count.subscribe(() => {})
  return promise_like
    .catch(e => {
      error = e
      dispatch('error', e)
    })
    .finally(unsubscribe)
}
</script>

{#if error}
  <slot name="error" { error }></slot>
{:else}
  {#if $list_status === LIST_STATUS.HIDDEN}
    <!-- Hidden -->
  {:else if loading || $list_status === LIST_STATUS.LOADING}
    <slot name="loading"></slot>
  {/if}

  <div hidden={ loading || $list_status !== LIST_STATUS.READY }>
    <slot { suspend }></slot>
  </div>
{/if}

<style>
div:not([hidden]) {
  display: contents;
}
</style>
