<script>
import { createSuspense } from '$lib'
import { getResource } from './api.js'
import Img from './img.svelte'
const suspend = createSuspense()

const friends = getResource().friends()
const friend_id = getResource().friend_id
</script>

{#await suspend(friends) then friends}
  <ul>
    {#each friends as friend}
      <li>
        <button
          class:active={friend.id === $friend_id}
          onclick={() => ($friend_id = friend.id)}
        >
          <Img src={friend.avatar} />
          <span>{friend.name}</span>
        </button>
      </li>
    {/each}
  </ul>
{/await}

<style>
button {
  align-items: center;
  background: none;
  border: none;
  color: #3182ce;
  cursor: pointer;
  display: flex;
  font: inherit;
  max-width: 100%;
  padding: 0.2em 0;
}
button:hover {
  color: #63b3ed;
}
button.active {
  font-weight: 600;
}

button :global(img) {
  border: 2px solid white;
  border-radius: 100%;
  height: 1.25em;
  margin-right: 0.25em;
  width: 1.25em;
}
button.active :global(img) {
  border-color: rgba(43, 108, 176);
}

button span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
