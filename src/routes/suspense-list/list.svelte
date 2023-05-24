<script lang="ts">
import type { Readable } from 'svelte/store'
import { Suspense } from '$lib'
import SuspenseList from '$lib/_suspense-list/suspense-list.svelte'
import Status from './status.svelte'

export let collapse: boolean
export let final: boolean
export let stores: Readable<boolean | undefined>[]
</script>

<SuspenseList {collapse} {final}>
  <ul>
    {#each stores as store}
      <li>
        <Suspense let:suspend>
          <svelte:fragment slot="loading">📦</svelte:fragment>
          <Status store={suspend(store)} />
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
