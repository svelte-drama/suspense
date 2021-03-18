<script>
import AlbumSkeleton from './album-skeleton.svelte'
import Suspense, { createSuspense, SuspenseList } from '@jamcart/suspense'
const suspend = createSuspense()

const Album = import('./album.svelte').then(m => m.default)
const request = fetch(`https://itunes.apple.com/us/rss/topalbums/limit=35/json`)
  .then(response => response.json())
  .then(data => data.feed.entry)
</script>

{#await suspend(request) then albums}
  <SuspenseList>
    <ul>
      {#each albums as album}
        <li>
          <Suspense let:suspend>
            <AlbumSkeleton slot="loading" />
  
            {#await suspend(Album) then Album}
              <Album { album } />
            {/await}
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
