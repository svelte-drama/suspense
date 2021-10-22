<script>
import AlbumList from './_album-list.svelte'
import Layout from './_layout.svelte'
import Loading from './_loading.svelte'
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
