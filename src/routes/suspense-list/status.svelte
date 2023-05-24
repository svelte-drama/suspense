<script lang="ts">
import type { Readable } from "svelte/store"

export let store: Readable<boolean | undefined>
</script>

<li>
  {#if $store === true}
    ✔️
  {:else }
    ⌛
  {/if}
</li>
