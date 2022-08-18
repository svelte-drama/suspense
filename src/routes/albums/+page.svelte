<script>
import AlbumList from './album-list.svelte'
import Layout from './layout.svelte'
import Loading from './loading.svelte'
import { Suspense } from '$lib'
</script>

<Layout>
  <Suspense>
    <AlbumList />
    <Loading slot="loading" />
    <p slot="error">Error!</p>
  </Suspense>
</Layout>

<style>
:global(body) {
  color: #333;
  font-family: sans-serif;
  margin: 0;
}
</style>
