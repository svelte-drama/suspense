<script lang="ts">
import { Suspense } from '$lib'
import AlbumList from './album-list.svelte'
import Loading from './loading.svelte'
import PageLayout from './page-layout.svelte'
</script>

<PageLayout>
  <Suspense>
    <AlbumList />

    {#snippet loading()}
      <Loading />
    {/snippet}

    {#snippet failed()}
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
