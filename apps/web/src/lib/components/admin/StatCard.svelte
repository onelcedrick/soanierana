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
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

  <path d="M12 2L3 9h18L12 2z"></path>
  <path d="M5 9v11h14V9"></path>
  <path d="M9 22V12h6v10"></path>
  <path d="M12 12v10"></path>
</svg>
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
