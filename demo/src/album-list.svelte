<script>
import Suspense, { createSuspense } from '@jamcart/suspense'
const suspend = createSuspense()

const Album = import('./album.svelte').then(m => m.default)
const request = fetch(`https://itunes.apple.com/us/rss/topalbums/limit=100/json`)
  .then(response => response.json())
  .then(data => data.feed.entry)
</script>

{#await suspend(request) then albums}
  <ul>
    {#each albums as album}
      <li>
        <Suspense let:suspend>
          <div slot="loading" class="loading">
            <div class="img"></div>
            <div class="title"></div>
            <div class="artist"></div>
          </div>

          {#await suspend(Album) then Album}
            <Album { album } />
          {/await}
        </Suspense>
      </li>
    {/each}
  </ul>
{/await}

<style>
ul {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
}
li {
  padding: 1em;
}

.loading > div {
  background: #F6F6FA;
}
.loading .img {
  height: 170px;
  width: 170px;
}
.loading .artist,
.loading .title {
  height: .9em;
  margin-top: .3em;
}
.loading .title {
  width: 90%;
}
.loading .artist {
  width: 60%;
}
</style>
