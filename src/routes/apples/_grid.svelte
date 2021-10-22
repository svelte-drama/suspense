<script>
import { Suspense } from '$lib'
import Apple from './_apple.svelte'
</script>

<div class="grid">
  {#each Array(500) as _}
    <div>
      <Suspense>
        <Apple />
        <svelte:fragment slot="loading">⌛</svelte:fragment>
      </Suspense>
    </div>
  {/each}
</div>

<style>
.grid {
  align-items: center;
  justify-items: center;
  display: grid;
  grid-auto-rows: 2em;
  grid-template-columns: repeat(auto-fill, minmax(2em, 1fr));
}
</style>
