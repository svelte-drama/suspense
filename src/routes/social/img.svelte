<script lang="ts">
import { createSuspense } from '$lib'

const suspend = createSuspense()

export let src

let onLoad: (value: unknown) => void
const loaded = new Promise((resolve) => {
  onLoad = resolve
})
suspend(loaded)
</script>

<img alt="" {src} on:load={onLoad} on:error={onLoad} />
