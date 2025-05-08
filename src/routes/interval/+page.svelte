<script lang="ts">
import Suspense from '$lib/_suspense/suspense.svelte'
import Timer from './timer.svelte'
</script>

<h1>Interval</h1>
<Suspense>
  <Timer />

  {#snippet failed()}
    ERROR
  {/snippet}

  {#snippet loading()}
    Fetching...
  {/snippet}
</Suspense>
