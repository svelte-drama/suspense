<script>
import AlbumList from './album-list.svelte'
import Layout from './layout.svelte'
import Loading from './loading.svelte'
import Suspense from '@jamcart/suspense'
</script>

<Layout>
	<Suspense>
		<p slot="error">Error!</p>
		<Loading slot="loading" />

		<AlbumList />
	</Suspense>
</Layout>

<style>
:global(body) {
  color: #333;
  font-family: sans-serif;
  margin: 0;
}
</style>
