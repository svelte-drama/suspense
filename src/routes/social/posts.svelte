<script>
import { Suspense, SuspenseList } from '$lib'
import { getResource } from './api.js'
import Comments from './comments.svelte'
import CommentsSkeleton from './comments-skeleton.svelte'
import Post from './post.svelte'
import PostSkeleton from './post-skeleton.svelte'

let posts = getResource().posts()
</script>

<div class="posts">
  {#await posts}
    <PostSkeleton />
    <PostSkeleton />
  {:then posts}
    <SuspenseList collapse>
      {#each posts as post}
        <Suspense>
          <article>
            <Post {post} />
            <Comments {post} />
          </article>

          {#snippet loading()}
            <article>
              <Post {post} />
              <CommentsSkeleton />
            </article>
          {/snippet}
        </Suspense>
      {/each}
    </SuspenseList>
  {/await}
</div>

<style>
.posts {
  align-items: flex-start;
  display: grid;
  grid-gap: 2em;
  grid-template-columns: repeat(auto-fill, minmax(25em, 1fr));
  padding: 2em 0;
}

article {
  background: white;
  border-radius: 0.5em;
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 10%),
    0 4px 6px -2px rgb(0 0 0 / 5%);
  overflow: hidden;
}
</style>
