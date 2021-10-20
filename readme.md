# Suspense for Svelte

This is a Svelte component that implements the core idea of React's `<Suspense>`.

When requesting asynchronous data, a typical pattern is for a parent component to handle all fetching and then push data down to its children.  This can become difficult as levels of nesting increase and add unnessecary amounts of complexity.  `<Suspense>` instead lets its children, at an arbitrary nested depth, dictate when they are done loading.

[Documentation](/suspense)

[See it in action](https://svelte.dev/repl/68f214326ffd40848272422836caa1f5?version=3.35.0)
