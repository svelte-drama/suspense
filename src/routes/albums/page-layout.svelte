<script lang="ts">
interface Props {
  children: import('svelte').Snippet
}
let { children }: Props = $props()
let refresh = $state(0)
</script>

<header>
  <h1>Top 50 Albums from iTunes</h1>
  <button type="button" onclick={() => refresh++}> Reload </button>
</header>

{#key refresh}
  {@render children()}
{/key}

<style>
button {
  background: none !important;
  border: none !important;
  color: inherit;
  cursor: pointer;
  margin: 0;
  padding: 1em;
  text-decoration: underline;
}
header {
  align-items: center;
  background: black;
  color: white;
  display: flex;
  justify-content: space-between;
}
h1 {
  margin: 0;
  padding: 0.5em;
}
</style>
