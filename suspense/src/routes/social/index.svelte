<script>
import './global.css'
import Content from './_components/content.svelte'
import Header from './_components/header.svelte'
import Sidebar from './_components/sidebar.svelte'
import { SuspenseList } from '$lib'
import { setResource } from './_components/api.js'
import { writable } from 'svelte/store'

let friend_id = writable(1)
$: setResource($friend_id, friend_id)
</script>

{#key $friend_id}
  <SuspenseList>
    <Header />

    <div>
      <Sidebar />
      <Content />
    </div>
  </SuspenseList>
{/key}

<style>
div {
  display: grid;
  grid-gap: 2em;
  grid-template-columns: 12em 1fr;
  margin: auto;
  max-width: 80em;
  padding: 1em;
}
</style>
