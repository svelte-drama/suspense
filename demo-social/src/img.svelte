<script>
import { writable } from 'svelte/store'
import { createSuspense } from '@jamcart/suspense'
const suspend = createSuspense()

const loaded = suspend(writable(undefined))
const resolve = () => loaded.set(true)

export let src
</script>

<img alt="" { src } on:load={ resolve } on:error={ resolve } />
