<script lang="ts">
import { Suspense } from '$lib'
import Apple from './apple.svelte'
</script>

<div class="grid">
  {#each Array(2000) as _}
    <div>
      <Suspense>
        <Apple />
        {#snippet loading()}
          ⌛
        {/snippet}
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
