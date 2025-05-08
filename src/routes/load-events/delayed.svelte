<script lang="ts">
import { suspend } from '$lib'

suspend(
  new Promise((resolve) => {
    setTimeout(resolve, 1000)
  })
)
</script>

<h1>Delayed</h1>
<p>This waited one second.</p>
