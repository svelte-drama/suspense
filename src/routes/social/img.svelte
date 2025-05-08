<script lang="ts">
import { suspend } from '$lib'

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
