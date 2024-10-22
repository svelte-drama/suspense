<script lang="ts">
import AlbumList from './album-list.svelte'
import PageLayout from './page-layout.svelte'
import Loading from './loading.svelte'
import { Suspense } from '$lib'
</script>

<PageLayout>
  <Suspense>
    <AlbumList />
    {#snippet loading()}
      <Loading />
    {/snippet}
    {#snippet error()}
      <p>Error!</p>
    {/snippet}
  </Suspense>
</PageLayout>

<style>
:global(body) {
  color: #333;
  font-family: sans-serif;
  margin: 0;
}
</style>
