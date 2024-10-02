<script>
import { createSuspense } from '$lib'
import { getResource } from './api.js'
import Img from './img.svelte'
const suspend = createSuspense()

/** @type {{post: any}} */
let { post } = $props()
// @ts-ignore
const comments = getResource().comments(post.id)
</script>

{#await suspend(comments) then comments}
  <h3>{comments.length} replies</h3>
  {#each comments as comment}
    <article>
      <Img src="https://i.pravatar.cc/32?u={comment.email}" />
      <h4>{comment.email}</h4>
      <p>{comment.name}.</p>
    </article>
  {/each}
{/await}

<style>
h3 {
  background: #f7fafc;
  border-top: 1px solid #e2e8f0;
  color: #718096;
  font-size: 0.75rem;
  margin: 0;
  padding: 0.25rem 2rem;
  text-transform: uppercase;
}

article {
  background: #edf2f7;
  column-gap: 0.75em;
  display: grid;
  grid-template-columns: 2em 1fr;
  padding: 1em 1.5em;
}
article > :global(img) {
  border: 2px solid white;
  border-radius: 0.5em;
  grid-row: span 2;
  margin-top: 0.25em;
}
h4,
p {
  margin: 0;
}
</style>
