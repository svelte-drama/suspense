<script lang="ts">
interface Props {
  state: true | undefined
}
let { state }: Props = $props()
</script>

<li>
  {state ? '✔️' : '⌛'}
</li>
