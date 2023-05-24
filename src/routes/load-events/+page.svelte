<script lang="ts">
import { Suspense } from '$lib'
import Delayed from './delayed.svelte'
</script>

<Suspense on:load={(e) => console.log('Loaded Empty', e.detail.element)}>
  <h1>Empty</h1>
  <p>Nothing here.</p>
</Suspense>

<Suspense on:load={(e) => console.log('Loaded Delayed', e.detail.element)}>
  <Delayed />

  <p slot="loading">Loading...</p>
</Suspense>
