<script lang="ts">
import { createEventDispatcher, onDestroy } from 'svelte'
import { derived, writable } from 'svelte/store'
import type { Readable } from 'svelte/store'
import debounce from '$lib/_debounce'
import { setContext } from './context'
import * as STATUS from './status'
import type { STATUS_VALUES } from './status'
import { sortOnDocumentOrder } from './util'

export let collapse = false

const dispatch = createEventDispatcher()

const children = writable([] as HTMLElement[])
const status = new Map<HTMLElement, boolean>()

const next = writable<number | null>(null)
function updateNext () {
  const elem = $children.findIndex((i) => !status.get(i))
  next.set(elem === -1 ? null : elem)
}

const isLoading = writable(false)
const updateIsLoading = debounce((loading: boolean) => {
  isLoading.set(loading)
})
$: updateIsLoading($next !== null)
$: !$isLoading && dispatch('load')

setContext(register)
function register(element: HTMLElement, loaded: Readable<boolean>) : Readable<STATUS_VALUES> {
  children.update($children => {
    $children.push(element)
    return $children.sort(sortOnDocumentOrder)
  })

  const unsubscribe = loaded.subscribe(loaded => {
    status.set(element, loaded)
    updateNext()
  })

  onDestroy(() => {
    unsubscribe()
    status.delete(element)
    children.update($children => {
      return $children.filter(i => i !== element)
    })
    updateNext()
  })

  return derived([next, children], ([$next, $children]) => {
    if ($next === null) {
      return STATUS.READY
    } else {
      const index = $children.findIndex(i => i === element)
      if (index < $next) return STATUS.READY
      if (index === $next) return STATUS.LOADING
      return collapse ? STATUS.HIDDEN : STATUS.LOADING
    }
  })
}
</script>

<slot loading={ $isLoading } />
