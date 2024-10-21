<script lang="ts">
import { createSuspense } from '$lib'

const suspend = createSuspense()

interface Props {
  album: any
}

let { album }: Props = $props()

let onload: (value: unknown) => void = $state(() => {})
const loaded = new Promise((resolve) => (onload = resolve))
suspend(loaded)

let src = $derived(album['im:image'][2].label)
let title = $derived(album['im:name'].label)
let artist = $derived(album['im:artist'].label)
let href = $derived(album.id.label)
</script>

<a {href} target="blank">
  <figure>
    <img {onload} {src} alt="" />
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
