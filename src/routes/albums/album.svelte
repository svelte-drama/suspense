<script lang="ts">
import { createSuspense } from '$lib'

const suspend = createSuspense()

export let album

let onLoad: (value: unknown) => void
const loaded = new Promise((resolve) => (onLoad = resolve))
suspend(loaded)

$: src = album['im:image'][2].label
$: title = album['im:name'].label
$: artist = album['im:artist'].label
$: href = album.id.label
</script>

<a {href} target="blank">
  <figure>
    <img on:load={onLoad} {src} alt="" />
    <figcaption>
      <span class="title">{title}</span>
      <span class="artist">{artist}</span>
    </figcaption>
  </figure>
</a>

<style>
a {
  color: inherit;
  display: block;
  text-decoration: none;
  width: 170px;
}
figcaption span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
figure {
  margin: 0;
  padding: 0;
}
img {
  height: 170px;
  width: 170px;
}
.artist {
  display: block;
  opacity: 0.7;
}
</style>
