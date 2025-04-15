<script lang="ts">
import type { Readable } from 'svelte/store'
import { Suspense } from '$lib'
import SuspenseList from '$lib/_suspense-list/suspense-list.svelte'
import Status from './status.svelte'

interface Props {
  collapse: boolean
  final: boolean
  models: { current: boolean }[]
}
let { collapse, final, models }: Props = $props()
</script>

<SuspenseList {collapse} {final}>
  <ul>
    {#each models as model}
      <li>
        <Suspense>
          {#snippet children(suspend)}
            <Status model={suspend(model)} />
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
