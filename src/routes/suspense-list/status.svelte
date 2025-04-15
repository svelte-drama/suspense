<script lang="ts">
interface Props {
  model: { current: boolean }
}
let { model }: Props = $props()
</script>

<li>
  {#if model.current === true}
    ✔️
  {:else}
    ⌛
  {/if}
</li>
