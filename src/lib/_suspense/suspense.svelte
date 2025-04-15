<script lang="ts">
import { tick } from 'svelte'
import { SvelteMap } from 'svelte/reactivity'
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

let loading = 0
let loaded = $state(true)

const errors = new SvelteMap<symbol, Error>()
const error = $derived.by<Error | undefined>(() => {
  if (errors.size) {
    return errors.values().next().value
  }
})

function createSubscriber() {
  let stopped = false
  if (loading === 0) {
    loaded = false
  }
  loading++

  return () => {
    if (stopped) return
    stopped = true
    tick().then(() => {
      loading--
      if (loading === 0) {
        loaded = true
      }
    })
  }
}

let element: HTMLDivElement | undefined = $state()
$effect(() => {
  if (onload && loaded && element) {
    onload(element)
  }
})
$effect(() => {
  if (onerror && error) {
    onerror(error)
  }
})

const registerWithList = getSuspenseListContext()
setSuspenseListContext()

const list = registerWithList({
  get loaded() {
    return loaded
  },
})

setContext({ promise: suspendPromise, rune: suspendRune })
const suspend = createSuspense()

function suspendPromise<T>(promise: Promise<T>) {
  let stopped = false
  const unsub = createSubscriber()

  const index = Symbol()
  promise
    .catch((error: Error) => {
      if (!stopped) {
        errors.set(index, error)
      }
    })
    .finally(unsub)

  return () => {
    stopped = true
    errors.delete(index)
    unsub()
  }
}

function suspendRune<T>(data: { current: T | undefined; error?: Error }) {
  if (data.current !== undefined) {
    // Pass
    return () => {}
  } else if (data.error) {
    const index = Symbol()
    errors.set(index, data.error)
    return () => {
      errors.delete(index)
    }
  } else {
    return createSubscriber()
  }
}
</script>

<svelte:boundary failed={renderError} {onerror}>
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
</svelte:boundary>

<style>
div:not([hidden]) {
  display: contents;
}
</style>
