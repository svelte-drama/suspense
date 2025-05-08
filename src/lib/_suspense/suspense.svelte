<script lang="ts">
import { tick } from 'svelte'
import {
  getSuspenseListContext,
  setSuspenseListContext,
} from '$lib/_suspense-list/context'
import { STATUS } from '$lib/_suspense-list/status'
import { setContext } from './context.svelte.js'

interface Props {
  children?: import('svelte').Snippet
  failed?: import('svelte').Snippet<[Error, () => void]>
  loading?: import('svelte').Snippet
  onerror?: (e: Error, reset: () => void) => void
  onload?: (element: HTMLElement) => void
}
let {
  children,
  failed: renderError,
  loading: renderLoading,
  onload,
  onerror: parentOnError,
}: Props = $props()

const isBrowser = typeof window !== 'undefined'

let loading = 0
let loaded = $state(true)

let async_error: null | Error = $state(null)
function getAsyncError() {
  if (async_error) {
    throw async_error
  }
}

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

const registerWithList = getSuspenseListContext()
setSuspenseListContext()

const list = registerWithList({
  get loaded() {
    return loaded
  },
})

setContext(suspend)
function suspend<T>(data: T) {
  $effect(() => {
    if (data === undefined) {
      return createSubscriber()
    } else if (isPromise(data)) {
      const unsub = createSubscriber()
      let stopped = false

      data
        .catch((e: Error) => {
          if (stopped) return
          async_error = e
        })
        .finally(unsub)

      return () => {
        stopped = true
        unsub()
      }
    }
  })

  return data
}

function onerror(error: Error, reset: () => void) {
  loaded = true
  parentOnError?.(error, () => {
    async_error = null
    reset()
  })
}

function isPromise(x: unknown): x is Promise<any> {
  return (
    !!x && typeof x === 'object' && 'then' in x && typeof x.then === 'function'
  )
}
</script>

<svelte:boundary {onerror}>
  {getAsyncError()}

  {#if isBrowser}
    <div
      bind:this={element}
      hidden={!loaded || !!async_error || list.status !== STATUS.READY}
    >
      {@render children?.()}
    </div>
  {/if}

  {#if list.status === STATUS.HIDDEN}
    <!-- Hidden -->
  {:else if !loaded || list.status === STATUS.LOADING}
    {@render renderLoading?.()}
  {/if}

  {#if renderError}
    {#snippet failed(error, reset)}
      {@render renderError?.(error as Error, () => {
        async_error = null
        reset()
      })}
    {/snippet}
  {/if}
</svelte:boundary>

<style>
div:not([hidden]) {
  display: contents;
}
</style>
