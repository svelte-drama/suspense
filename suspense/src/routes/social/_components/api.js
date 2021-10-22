import { getContext, setContext } from 'svelte'

const CONTEXT = {}
const friends = get(`/users?_limit=${rand(6, 5)}`).then((friends) => {
  return friends.map(setAvatar)
})

export function getResource() {
  return getContext(CONTEXT)
}

export function setResource(friend_id, friend_id_store) {
  const posts = get(`/posts/${friend_id}/posts?_limit=${rand(4, 4)}`, 1000)
  const friend = get(`/users/${friend_id}`, 500).then(setAvatar)

  const resource = {
    comments(post_id) {
      return get(`/posts/${post_id}/comments?_limit=${rand(1, 5)}`, 1500)
    },
    friend: () => friend,
    friends: () => friends,
    posts: () => posts,
    friend_id: friend_id_store,
  }
  setContext(CONTEXT, resource)
  return resource
}

async function get(url, timeout = 0) {
  const response = await fetch(`https://jsonplaceholder.typicode.com` + url)
  const json = await response.json()
  await new Promise((resolve) => {
    setTimeout(resolve, rand(timeout, 1000))
  })
  return json
}

function rand(start, range) {
  return start + Math.floor(Math.random() * range)
}

function setAvatar(friend) {
  friend.avatar = `https://i.pravatar.cc/256?img=${friend.id + 4}`
  return friend
}
