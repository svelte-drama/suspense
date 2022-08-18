<script>
import Album from './album.svelte'
import AlbumSkeleton from './album-skeleton.svelte'
import { createSuspense, Suspense, SuspenseList } from '$lib'
const suspend = createSuspense()

const request = fetch(`https://itunes.apple.com/us/rss/topalbums/limit=50/json`)
  .then((response) => response.json())
  .then((data) => data.feed.entry)
</script>

{#await suspend(request) then albums}
  <SuspenseList>
    <ul>
      {#each albums as album}
        <li>
          <Suspense>
            <Album {album} />
            <AlbumSkeleton slot="loading" />
          </Suspense>
        </li>
      {/each}
    </ul>
  </SuspenseList>
{/await}

<style>
ul {
  display: grid;
  grid-gap: 1em;
  grid-template-columns: repeat(auto-fill, 170px);
  justify-content: center;
  list-style: none;
  margin: 0;
  padding: 1em;
}
</style>
