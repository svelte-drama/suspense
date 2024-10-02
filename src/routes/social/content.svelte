<script>
import { Suspense } from '$lib'
import { getResource } from './api.js'
import FriendCard from './friend-card.svelte'
import Posts from './posts.svelte'
import Spinner from './spinner.svelte'

const friend = getResource().friend()
</script>

<main>
  <Suspense>
    <FriendCard />
    <Posts />

    {#snippet loading()}
      <div class="loading">
        <Spinner />
        {#await friend}
          Loading Friend...
        {:then friend}
          Loading {friend.name}...
        {/await}
      </div>
    {/snippet}
  </Suspense>
</main>

<style>
.loading {
  text-align: center;
}
</style>
