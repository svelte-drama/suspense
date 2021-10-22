<script>
import { SuspenseList } from '$lib'
import Grid from './_grid.svelte'
import Selector from './_selector.svelte'

export let mode = 'without'

function onLoad() {
  console.log('All apples loaded')
}
</script>

<h1>{'<SuspenseList> Demo'}</h1>

<Selector bind:mode />

{#if mode === 'without'}
  <Grid />
{/if}
{#if mode === 'with'}
  <SuspenseList on:load={onLoad}>
    <Grid />
  </SuspenseList>
{/if}
{#if mode === 'collapse'}
  <SuspenseList collapse on:load={onLoad}>
    <Grid />
  </SuspenseList>
{/if}

<style>
h1 {
  text-align: center;
}
</style>
