<script>
import AlbumList from './album-list.svelte'
import Loading from './loading.svelte'
import Suspense from '@jamcart/suspense'
</script>

<h1>Top 100 Albums from iTunes</h1>
<Suspense>
  <p slot="error">Error!</p>
  <Loading slot="loading" />

  <AlbumList />
</Suspense>

<style>
:global(body) {
  color: #333;
  font-family: sans-serif;
  margin: 0;
}
h1 {
  background: black;
  color: white;
  margin: 0;
  padding: .5em;
  text-align: center;
}
</style>
