<script>
import { writable } from 'svelte/store'
import { createSuspense } from '$lib'
const suspend = createSuspense()

const loaded = suspend(writable(undefined))
const resolve = () => loaded.set(true)

export let src
</script>

<img alt="" {src} on:load={resolve} on:error={resolve} />
