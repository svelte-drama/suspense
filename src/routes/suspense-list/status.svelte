<script lang="ts">
import type { Readable } from 'svelte/store'

interface Props {
  store: Readable<boolean | undefined>
}

let { store }: Props = $props()
</script>

<li>
  {#if $store === true}
    ✔️
  {:else}
    ⌛
  {/if}
</li>
