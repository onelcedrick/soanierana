<script lang="ts">
  export let title: string;
  export let value: string;
  export let trend: string;
  export let color: 'blue' | 'green' | 'purple' | 'orange';
  export let icon: string;

  const colorMap = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', stroke: '#2563eb' },
    green: { bg: 'bg-emerald-100', text: 'text-emerald-600', stroke: '#10b981' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', stroke: '#9333ea' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', stroke: '#f97316' }
  };
  $: c = colorMap[color];
</script>

<div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col justify-between h-32">
  <div class="flex items-center gap-4">
    <div class="w-12 h-12 rounded-full {c.bg} {c.text} flex items-center justify-center shrink-0">
      {#if icon === 'users'}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
      {:else if icon === 'calendar'}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
      {:else if icon === 'poll'}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20v-6"></path></svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
      {/if}
    </div>
    <div>
      <p class="text-sm text-slate-500 font-medium">{title}</p>
      <div class="flex items-center gap-2">
        <h3 class="text-2xl font-bold text-slate-900">{value}</h3>
        <span class="text-xs text-emerald-500 font-bold bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          {trend}
        </span>
      </div>
    </div>
  </div>
  <svg viewBox="0 0 100 20" class="w-full h-6 mt-2" preserveAspectRatio="none">
    <path d="M0,15 Q10,10 20,12 T40,5 T60,10 T80,2 T100,8" fill="none" stroke={c.stroke} stroke-width="2" stroke-linecap="round"/>
  </svg>
</div>
