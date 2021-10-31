# Suspense for Svelte

This is a Svelte component that implements the core idea of React's `<Suspense>`.

When requesting asynchronous data, a typical pattern is for a parent component to handle all fetching and then push data down to its children. This can become difficult as levels of nesting increase and add unnessecary amounts of complexity. `<Suspense>` instead lets its children, at an arbitrary nested depth, dictate when they are done loading.

[See it in action](https://svelte.dev/repl/91183af6db654f2099806426ff3bbb4b?version=3.44.0)

## `createSuspense`

Child components need to register what data they depend on. `createSuspense` returns a function to to handle orchestration between this component and its nearest descendant `<Suspense>` component.

Because it relies on [getContext](https://svelte.dev/docs#getContext), this must be declared during component initialization.

```js
import { createSuspense } from '@svelte-drama/suspense'
const suspend = createSuspense()
```

The resulting function, `suspend`, can be used in two different ways.

```js
suspend(data: Promise) => data
```

Register a promise. This returns a promise, allowing it to be used as part of a promise chain. The containing `<Suspense>` component will display its `loading` state until the promise is resolved. If the promise is rejected, it will instead show the `error` state.

```js
suspend(data: Readable) => data
suspend(data: Readable, error: Readable) => data
```

Register a store. `<Suspense>` will consider this resolved as long as `data` resolves to not `undefined`. If `error` is passed in, `<Suspense>` will display the error state as long as `data` is undefined and `error` is not.

## `<Suspense>`

`<Suspense>` provides three slots, only one of which will be displayed at a time. All three are optional.

- _loading_: If there any pending requests, this slot will be displayed.
- _error_: Once a request fails, this slot is displayed. The caught error is [passed to the slot](https://svelte.dev/docs#slot_let) as `error`.
- _default_: After all children have finished loading data, display this.

Two events are availabe:

- _on:error_: Triggers after a promise given to `suspend` is rejected. The original error is passed as part of `event.detail`.
- _on:load_: Triggers when all components inside the `<Suspense>` block have finished loading.

```svelte
<script>
import { createSuspense, Suspense } from '@svelte-drama/suspense'
const suspend = createSuspense()

const MyComponent = import('./my-component.svelte').then((m) => m.default)
</script>

<Suspense
  let:suspend
  on:error={(e) => console.error(e.details)}
  on:load={() => console.log('loaded')}
>
  <p slot="loading">Loading...</p>
  <p slot="error" let:error>Error: {error?.message || error}</p>

  <h1>My Component</h1>
  {#await suspend(MyComponent) then MyComponent}
    <MyComponent />
  {/await}
</Suspense>
```

## `<SuspenseList>`

`<SuspenseList>` orchestrates the loading of all child `<Suspense>` containers. It guarantees they will load in display order. This is useful to avoid multiple, distracting pop-ins of content or reflow of elements while the user is reading.

- _collapse_: Boolean. Defaults to `false`. If `true`, only one loading state will be shown among the children.
- _let:loading: Boolean.  Indicates if any child Suspense component is still awaiting data.
- _on:load_: Triggers when all components inside the `<SuspenseList>` have finished loading.

```svelte
<script>
import { Suspense, SuspenseList } from '@svelte-drama/suspense'
import Loading from './loading.svelte'
import Post from './my-component.svelte'

export let posts
</script>

<SuspenseList let:loading>
  {#if loading}
    <p>Fetching posts...</p>
  {/if}

  {#each posts as post}
    <Suspense>
      <Post {post} />

      <Loading slot="loading" />
    </Suspense>
  {/each}
</SuspenseList>
```

## Limitations

- [Intro transitions](https://svelte.dev/docs#transition_fn) will not work as expected on elements inside the default slot. Elements are rendered in a hidden container as soon as possible, which triggers these intro transitions prematurely.
- SSR will only display the loading component. Implementing `<Suspense>` during SSR would require Svelte to support `async/await` during SSR.
- `createSuspense` operates at component boundaries. The following example causes the parent of "my-component.svelte" to suspend, not the `<Suspense>` block inside of it, despite initial appearances:

```svelte
<script>
import getData from './get-data.js'
import Suspense, { createSuspense } from '@svelte-drama/suspense'
const suspend = createSuspense()
const request = getData()
</script>

<Suspense>
  {#await suspend(request) then data}
    {JSON.stringify(data)}
  {/await}
</Suspense>
```

This, however, will work as it looks:

```svelte
<script>
import getData from './get-data.js'
import Suspense from '@svelte-drama/suspense'
const request = getData()
</script>

<Suspense let:suspend>
  {#await suspend(request) then data}
    {JSON.stringify(data)}
  {/await}
</Suspense>
```
