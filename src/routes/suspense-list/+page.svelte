<script lang="ts">
import List from './list.svelte'
import Status from './status.svelte'

const OPTIONS = [undefined, true, true] as const
function createModel() {
  let current: true | undefined = $state(undefined)

  $effect(() => {
    let timer: ReturnType<typeof setTimeout>

    function update() {
      const timeout = 1500
      const value = OPTIONS[Math.floor(Math.random() * OPTIONS.length)]
      timer = setTimeout(() => {
        current = value
        update()
      }, timeout)
    }

    update()
    return () => clearInterval(timer)
  })

  return {
    get current() {
      return current
    },
  }
}

const models = [
  createModel(),
  createModel(),
  createModel(),
  createModel(),
  createModel(),
]
</script>

<h1>Stores</h1>
<ul>
  {#each models as model}
    <Status state={model.current} />
  {/each}
</ul>

<h2>Suspense List</h2>
<List collapse={false} final={false} {models} />

<h2>Suspense List w/ Collapse</h2>
<List collapse={true} final={false} {models} />

<h2>Suspense List w/ Final</h2>
<List collapse={false} final={true} {models} />

<h2>Suspense List w/ Collapse & Final</h2>
<List collapse={true} final={true} {models} />

<style>
ul {
  display: flex;
  gap: 1em;
  list-style: none;
  padding: 1em 0;
  margin: 0;
}
</style>
