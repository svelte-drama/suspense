<script>
import { SuspenseList } from '$lib'
import Grid from './grid.svelte'
import Selector from './selector.svelte'

let mode = $state('without')

function onload() {
  console.log('All apples loaded')
}
</script>

<h1>{'<SuspenseList> Demo'}</h1>

<Selector bind:mode />

{#if mode === 'without'}
  <Grid />
{/if}
{#if mode === 'with'}
  <SuspenseList {onload}>
    <Grid />
  </SuspenseList>
{/if}
{#if mode === 'collapse'}
  <SuspenseList collapse final {onload}>
    <Grid />
  </SuspenseList>
{/if}

<style>
h1 {
  text-align: center;
}
</style>
