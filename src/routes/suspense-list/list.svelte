<script lang="ts">
import { Suspense } from '$lib'
import SuspenseList from '$lib/_suspense-list/suspense-list.svelte'

interface Props {
  collapse?: boolean
  final?: boolean
  promises: Promise<unknown>[]
}

let { collapse, final, promises }: Props = $props()
</script>

<SuspenseList {collapse} {final}>
  <ul>
    {#each promises as data}
      <li>
        <Suspense>
          {#snippet children(suspend)}
            {#await suspend(data) then _}
              ✔️
            {/await}
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
