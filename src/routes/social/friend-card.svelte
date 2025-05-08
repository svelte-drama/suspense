<script>
import { suspend } from '$lib'
import { getResource } from './api.js'

let friend = getResource().friend()
let posts = getResource().posts()
</script>

{#await suspend(friend) then friend}
  <section>
    <div
      class="cover"
      style="background-image: url('http://placekitten.com/800/200?image={friend.id}')"
    ></div>

    <header>
      <div>
        <h1>{friend.name}</h1>
        <div>{friend.email}</div>
      </div>
      <img alt="" class="avatar" src={friend.avatar} />
    </header>

    <div class="info">
      <div>{friend.website}</div>
      <div>{friend.company.catchPhrase}</div>
      <div>
        {#await posts then posts}
          Has written {posts.length} posts
        {/await}
      </div>
    </div>
  </section>
{/await}

<style>
section {
  background: white;
  border-radius: 0.5rem;
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 10%),
    0 4px 6px -2px rgb(0 0 0 / 5%);
  overflow: hidden;
}
.cover {
  background-size: cover;
  height: 8em;
}

h1 {
  color: black;
  font-size: 1.5em;
  font-weight: 200;
  margin: 0;
}
header {
  align-items: center;
  color: #718096;
  display: flex;
  flex-direction: row-reverse;
  justify-content: flex-end;
  margin-top: -3em;
  margin-left: 1em;
}
header > div {
  background: white;
  border-top-right-radius: 9999px;
  border-bottom-right-radius: 9999px;
  margin-left: -1.5em;
  padding: 0.5em 1em 0 2em;
}
img {
  border: 0.25em solid white;
  border-radius: 50%;
  box-shadow:
    0 1px 3px 0 rgb(0 0 0 / 10%),
    0 1px 2px 0 rgb(0 0 0 / 6%);
  height: 5.75em;
  position: relative;
  width: 5.75em;
}

.info {
  display: grid;
  justify-items: center;
  grid-gap: 1em;
  grid-template-columns: repeat(3, 1fr);
  padding: 1em;
}
.info div {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
