<script lang="ts">
import { readable } from 'svelte/store'
import List from './list.svelte'
import Status from './status.svelte'

const OPTIONS = [undefined, true, true]
function createStore() {
  return readable<undefined | boolean>(undefined, (set) => {
    let timer: ReturnType<typeof setTimeout>

    function update() {
      const timeout = 1500
      const value = OPTIONS[Math.floor(Math.random() * 3)]
      timer = setTimeout(() => {
        set(value)
        update()
      }, timeout)
    }

    update()
    return () => clearInterval(timer)
  })
}

const stores = [
  createStore(),
  createStore(),
  createStore(),
  createStore(),
  createStore(),
]
</script>

<h1>Stores</h1>
<ul>
  {#each stores as store}
    <Status {store} />
  {/each}
</ul>

<h2>Suspense List</h2>
<List collapse={false} final={false} {stores} />

<h2>Suspense List w/ Collapse</h2>
<List collapse={true} final={false} {stores} />

<h2>Suspense List w/ Final</h2>
<List collapse={false} final={true} {stores} />

<h2>Suspense List w/ Collapse & Final</h2>
<List collapse={true} final={true} {stores} />

<style>
ul {
  display: flex;
  gap: 1em;
  list-style: none;
  padding: 1em 0;
  margin: 0;
}
</style>
