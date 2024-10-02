<script lang="ts">
import { Suspense } from '$lib'
import Delayed from './delayed.svelte'
</script>

<Suspense onload={(element) => console.log('Loaded Empty', element)}>
  <h1>Empty</h1>
  <p>Nothing here.</p>
</Suspense>

<Suspense onload={(element) => console.log('Loaded Delayed', element)}>
  <Delayed />

  {#snippet loading()}
    <p>Loading...</p>
  {/snippet}
</Suspense>
