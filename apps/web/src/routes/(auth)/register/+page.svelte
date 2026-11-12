<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  onMount(() => { goto('/login'); });
</script>
<p class="text-center text-slate-500">Redirection...</p>
