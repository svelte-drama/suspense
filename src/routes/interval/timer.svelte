<script lang="ts">
import { suspend } from '$lib'

async function fetchTime(): Promise<string> {
  const request = await fetch(
    'https://worldtimeapi.org/api/timezone/America/Chicago'
  )
  const response = await request.json()
  return response.datetime
}

let data = $state(fetchTime())
$effect(() => {
  const interval = setInterval(() => {
    data = fetchTime()
  }, 1000)
  return () => clearInterval(interval)
})
</script>

{#await suspend(data) then time}
  {time}
{/await}
