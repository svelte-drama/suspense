<script lang="ts">
import { createSuspense } from '$lib'

const suspend = createSuspense()

interface Props {
  src: any
}

let { src }: Props = $props()

let onload: (value: unknown) => void = $state(() => {})
const loaded = new Promise((resolve) => {
  onload = resolve
})
suspend(loaded)
</script>

<img alt="" {src} {onload} onerror={onload} />
