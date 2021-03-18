<script>
export let post
</script>

<div class="post">
  <h2>{ post.title }</h2>
  <p>{ post.body }</p>  
</div>

<style>
.post {
  padding: 1.5em;
}
h2 {
  font-size: 1.25em;
  font-weight: 700;
  margin: 0;
  text-transform: capitalize;
}
p {
  margin: 0;
}
</style>