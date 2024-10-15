<script lang="ts">
import type { Readable } from 'svelte/store'
import { Suspense } from '$lib'
import SuspenseList from '$lib/_suspense-list/suspense-list.svelte'
import Status from './status.svelte'

interface Props {
  collapse: boolean
  final: boolean
  stores: Readable<boolean | undefined>[]
}

let { collapse, final, stores }: Props = $props()
</script>

<SuspenseList {collapse} {final}>
  <ul>
    {#each stores as store}
      <li>
        <Suspense>
          {#snippet children(suspend)}
            <Status store={suspend(store)} />
          {/snippet}
          {#snippet loading()}
            📦
          {/snippet}
        </Suspense>
      </li>
    {/each}
  </ul>
</SuspenseList>

<style>
ul {
  display: flex;
  gap: 1em;
  list-style: none;
  padding: 1em 0;
  margin: 0;
}
</style>
