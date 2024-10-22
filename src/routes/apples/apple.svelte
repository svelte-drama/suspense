<script lang="ts">
import { suspend } from '$lib'

function timer() {
  return new Promise((resolve) => {
    const timeout = Math.round(Math.random() * 2000)
    setTimeout(resolve, timeout)
  })
}
</script>

{#await suspend(timer()) then _}
  🍎
{/await}
