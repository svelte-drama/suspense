<script>
import { createSuspense } from '@jamcart/suspense'
const suspend = createSuspense()
const resolve = suspend().resolve

export let src
</script>

<img alt="" { src } on:load={ resolve } on:error={ resolve } />
