<script lang="ts">
import List from './list.svelte'

function createPromise() {
  return new Promise((resolve) => {
    setTimeout(resolve, Math.random() * 2000)
  })
}

const promises = $state([
  createPromise(),
  createPromise(),
  createPromise(),
  createPromise(),
  createPromise(),
  createPromise(),
])
</script>

<h2>Suspense List</h2>
<List {promises} />

<h2>Suspense List w/ Collapse</h2>
<List {promises} collapse />

<h2>Suspense List w/ Final</h2>
<List {promises} final />

<h2>Suspense List w/ Collapse & Final</h2>
<List {promises} collapse final />
