<script lang="ts">
interface Props {
  mode: string
}
let { mode = $bindable() }: Props = $props()
</script>

<ul>
  {#each [['without', 'Without SuspenseList'], ['with', 'SuspenseList'], ['collapse', 'w/ collapse']] as [mode_, label]}
    <li>
      <button class:active={mode === mode_} onclick={() => (mode = mode_)}>
        {label}
      </button>
    </li>
  {/each}
</ul>

<style>
ul {
  display: flex;
  list-style: none;
  margin: 0 auto;
  max-width: 45em;
  padding: 1em;
}
li {
  flex: 1;
}
button {
  cursor: pointer;
  display: block;
  height: 100%;
  width: 100%;
}
button.active {
  background: none;
  border-color: black;
}
</style>
