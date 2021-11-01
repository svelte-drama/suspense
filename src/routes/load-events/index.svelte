<script>
import { Suspense } from '$lib'
import Delayed from './_delayed.svelte'
</script>

<Suspense on:load={ () => console.log("Loaded Empty") }>
  <h1>Empty</h1>
  <p>Nothing here.</p>
</Suspense>

<Suspense on:load={ () => console.log("Loaded Delayed") }>
  <Delayed />

  <p slot="loading">Loading...</p>
</Suspense>
