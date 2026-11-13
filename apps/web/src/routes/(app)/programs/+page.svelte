<script lang="ts">
  import { confirmStore } from '$lib/stores/confirm';
  import { auth } from '$lib/stores/auth';
  import { 
    listPrograms, createProgram, deleteProgram, 
    listTasks, createTask, updateTask, deleteTask, 
    createSession, generateAssignments, getSessionAssignments, publishSession,
    type Program, type Task, type SessionAssignment 
  } from '$lib/api/programs';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';

  let programs: Program[] = [];
  let loading = true;
  let message = '';
  let error = '';

  // Programme
  let newProgram = { name: '', frequency: 'WEEKLY', dayOfWeek: 3 };
  
  // Tâches
  let selectedProgramForTasks: string = '';
  let tasks: Task[] = [];
  let loadingTasks = false;
  let newTask = { 
    name: '', requiredPeople: 1, minimumGrade: '',
    allowedStatuses: ['LOCAL_BAPTIZED', 'EXTERNAL_BAPTIZED', 'UNBAPTIZED'] as string[]
  };
  let showTaskForm = false;
  let editingTaskId: string | null = null;

  // Génération
  let selectedProgramForGen = '';
  let sessionDate = new Date().toISOString().split('T')[0];
  let generating = false;
  let assignments: SessionAssignment[] = [];
  let generatedSessionId: string | null = null;
  
  // Publication
  let isPublishing = false;
  let isPublished = false;

  onMount(async () => {
    if (!get(auth).token) return goto('/login');
    await loadPrograms();
  });

  async function loadPrograms() {
    loading = true;
    try {
      programs = await listPrograms(get(auth).user!.churchId);
      if (programs.length > 0 && !selectedProgramForTasks) {
        selectedProgramForTasks = programs[0].id;
        selectedProgramForGen = programs[0].id;
        await loadTasks(programs[0].id);
      }
    } catch (err) { error = 'Erreur chargement programmes'; }
    finally { loading = false; }
  }

  async function loadTasks(programId: string) {
    loadingTasks = true;
    try {
      tasks = await listTasks(programId);
    } catch (err) { console.error(err); }
    finally { loadingTasks = false; }
  }

  async function onCreateProgram(e: Event) {
    e.preventDefault();
    message = ''; error = '';
    try {
      await createProgram({ ...newProgram, churchId: get(auth).user!.churchId }, get(auth).token!);
      message = 'Programme créé avec succès !';
      newProgram.name = '';
      await loadPrograms();
    } catch (err) { error = 'Erreur création programme.'; }
  }

  async function onDeleteProgram() {
    const confirmed = await confirmStore.confirm({ title: 'Confirmation', message: 'Supprimer ce programme et toutes ses tâches ?', type: 'danger' });
          if (!confirmed) return;
    try {
      await deleteProgram(selectedProgramForTasks, get(auth).token!);
      message = 'Programme supprimé';
      selectedProgramForTasks = '';
      await loadPrograms();
    } catch (err) { error = 'Erreur suppression programme'; }
  }

  function startEditTask(t: Task) {
    editingTaskId = t.id;
    newTask = { 
      name: t.name, requiredPeople: t.requiredPeople, minimumGrade: t.minimumGrade || '',
      allowedStatuses: t.allowedMembershipStatuses || ['LOCAL_BAPTIZED', 'EXTERNAL_BAPTIZED', 'UNBAPTIZED']
    };
    showTaskForm = true;
  }

  function cancelTaskForm() {
    showTaskForm = false;
    editingTaskId = null;
    newTask = { name: '', requiredPeople: 1, minimumGrade: '', allowedStatuses: ['LOCAL_BAPTIZED', 'EXTERNAL_BAPTIZED', 'UNBAPTIZED'] };
  }

  async function onSubmitTask(e: Event) {
    e.preventDefault();
    try {
      const payload = {
        name: newTask.name,
        requiredPeople: newTask.requiredPeople,
        eligibilityMode: newTask.minimumGrade ? 'MINIMUM_GRADE' : 'MEMBER',
        minimumGrade: newTask.minimumGrade || null,
        allowedMembershipStatuses: newTask.allowedStatuses,
      };

      if (editingTaskId) {
        await updateTask(editingTaskId, payload, get(auth).token!);
        message = 'Tâche modifiée';
      } else {
        await createTask({ programId: selectedProgramForTasks, ...payload }, get(auth).token!);
        message = 'Tâche ajoutée';
      }
      cancelTaskForm();
      await loadTasks(selectedProgramForTasks);
    } catch (err) { error = 'Erreur enregistrement tâche'; }
  }

  async function onDeleteTask(id: string) {
    const confirmed = await confirmStore.confirm({ title: 'Confirmation', message: 'Supprimer cette tâche ?', type: 'danger' });
          if (!confirmed) return;
    try {
      await deleteTask(id, get(auth).token!);
      message = 'Tâche supprimée';
      await loadTasks(selectedProgramForTasks);
    } catch (err) { error = 'Erreur suppression tâche'; }
  }

  async function onGenerateAssignments(e: Event) {
    e.preventDefault();
    message = ''; error = '';
    generating = true;
    assignments = [];
    isPublished = false;
    
    try {
      const sess = await createSession({ programId: selectedProgramForGen, date: new Date(sessionDate).toISOString() }, get(auth).token!);
      generatedSessionId = sess.id;
      
      const res = await generateAssignments(sess.id, get(auth).token!);
      message = `Succès ! ${res.assigned} affectations créées.`;
      
      assignments = await getSessionAssignments(sess.id, get(auth).token!);
    } catch (err) { error = 'Erreur génération.'; }
    finally { generating = false; }
  }

  async function onPublishSession() {
    if (!generatedSessionId) return;
    const confirmed = await confirmStore.confirm({ title: 'Confirmation', message: 'Une fois publié, ces membres seront occupés pour le reste de la semaine. Confirmer ?', type: 'warning' });
          if (!confirmed) return;
    
    isPublishing = true;
    try {
      await publishSession(generatedSessionId, get(auth).token!);
      isPublished = true;
      message = 'Programme publié avec succès ! Une actualité a été créée en brouillon.';
    } catch (err) {
      error = 'Erreur lors de la publication.';
    } finally {
      isPublishing = false;
    }
  }

  function toggleStatus(status: string) {
    if (newTask.allowedStatuses.includes(status)) {
      newTask.allowedStatuses = newTask.allowedStatuses.filter(s => s !== status);
    } else {
      newTask.allowedStatuses = [...newTask.allowedStatuses, status];
    }
  }
</script>

<div class="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-10">
  <!-- En-tête -->
  <div>
    <h1 class="text-2xl md:text-3xl font-bold text-slate-900">Programmes & Tâches</h1>
    <p class="text-sm md:text-base text-slate-500 mt-1">Configurez vos programmes, ajoutez des rôles et générez les affectations.</p>
  </div>

  {#if message}
    <div class="bg-green-50 text-green-700 p-3 rounded-xl border border-green-200 flex items-start gap-2 shadow-sm">
      <svg class="mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      {message}
    </div>
  {/if}
  {#if error}
    <div class="bg-red-50 text-red-600 p-3 rounded-xl border border-red-200 flex items-start gap-2 shadow-sm">
      <svg class="mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
      {error}
    </div>
  {/if}

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    
    <!-- SECTION 1 : CRÉER UN PROGRAMME -->
    <div class="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 class="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
        <svg class="text-brand-600" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
        Nouveau Programme
      </h2>
      <form on:submit={onCreateProgram} class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Nom du programme</label>
          <input bind:value={newProgram.name} required placeholder="Ex: Culte du Mercredi" class="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm md:text-base transition" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Fréquence</label>
            <select bind:value={newProgram.frequency} class="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none focus:border-brand-500 bg-slate-50 text-sm md:text-base cursor-pointer">
              <option value="WEEKLY">Hebdomadaire</option>
              <option value="BIWEEKLY">Bimensuel</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Jour</label>
            <select bind:value={newProgram.dayOfWeek} class="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none focus:border-brand-500 bg-slate-50 text-sm md:text-base cursor-pointer">
              <option value={0}>Dimanche</option>
              <option value={1}>Lundi</option>
              <option value={2}>Mardi</option>
              <option value={3}>Mercredi</option>
              <option value={4}>Jeudi</option>
              <option value={5}>Vendredi</option>
              <option value={6}>Samedi</option>
            </select>
          </div>
        </div>
        <button type="submit" class="w-full bg-slate-900 text-white font-bold rounded-xl py-3 hover:bg-slate-800 transition shadow-sm text-sm md:text-base">
          Créer le programme
        </button>
      </form>
    </div>

    <!-- SECTION 2 : GESTION DES TÂCHES -->
    <div class="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 class="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
        <svg class="text-brand-600" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        Tâches du programme
      </h2>
      
      <div class="flex flex-col sm:flex-row gap-2 mb-5">
        <select value={selectedProgramForTasks} on:change={(e) => { selectedProgramForTasks = (e.target as HTMLSelectElement).value; loadTasks(selectedProgramForTasks); }} class="flex-1 w-full border border-slate-300 px-4 py-2.5 rounded-xl bg-slate-50 font-medium outline-none focus:border-brand-500 text-sm md:text-base cursor-pointer">
          {#each programs as p}
            <option value={p.id}>{p.name}</option>
          {/each}
        </select>
        {#if selectedProgramForTasks}
          <button on:click={onDeleteProgram} class="w-full sm:w-auto bg-red-50 text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-100 transition flex items-center justify-center gap-2 font-medium" title="Supprimer le programme">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <span class="sm:hidden">Supprimer</span>
          </button>
        {/if}
      </div>

      {#if loadingTasks}
        <p class="text-sm text-slate-500">Chargement des tâches...</p>
      {:else}
        <ul class="space-y-2 mb-5">
          {#each tasks as t}
            <li class="flex flex-col sm:flex-row justify-between sm:items-center bg-slate-50 p-3 rounded-xl border border-slate-200 gap-2 sm:gap-0 text-sm group">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-bold text-slate-800">{t.name}</span> 
                <span class="text-slate-500 text-xs bg-white border border-slate-200 px-2 py-0.5 rounded-md">{t.requiredPeople} pers.</span>
                {#if t.minimumGrade}
                  <span class="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wide">{t.minimumGrade}</span>
                {/if}
              </div>
              <!-- CRUCIAL : Opacité 100 sur mobile (pas de hover), et opacité 0 sur PC avec hover -->
              <div class="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition self-end sm:self-auto">
                <button on:click={() => startEditTask(t)} class="text-slate-500 hover:text-brand-600 bg-white border border-slate-200 p-1.5 rounded-lg shadow-sm" title="Modifier">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button on:click={() => onDeleteTask(t.id)} class="text-slate-500 hover:text-red-600 bg-white border border-slate-200 p-1.5 rounded-lg shadow-sm" title="Supprimer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </li>
          {/each}
        </ul>

        {#if showTaskForm}
          <form on:submit={onSubmitTask} class="bg-brand-50/50 p-4 rounded-xl border border-brand-100 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">Nom de la tâche</label>
              <input bind:value={newTask.name} required placeholder="Ex: Nettoyage" class="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none focus:border-brand-500 text-sm md:text-base transition" />
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Personnes requises</label>
                <input type="number" bind:value={newTask.requiredPeople} min="1" class="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none focus:border-brand-500 text-sm md:text-base transition" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">Grade minimum</label>
                <select bind:value={newTask.minimumGrade} class="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none focus:border-brand-500 bg-white text-sm md:text-base cursor-pointer">
                  <option value="">Aucun grade requis</option>
                  <option value="DIAKONA">Diacre</option>
                  <option value="LOHOLONA">Loholona</option>
                </select>
              </div>
            </div>
            
            <div class="bg-white p-3 rounded-xl border border-slate-200">
              <p class="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Qui peut participer ?</p>
              <div class="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={newTask.allowedStatuses.includes('LOCAL_BAPTIZED')} on:change={() => toggleStatus('LOCAL_BAPTIZED')} class="rounded text-brand-600 focus:ring-brand-500 w-4 h-4" />
                  Baptisé Local
                </label>
                <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={newTask.allowedStatuses.includes('EXTERNAL_BAPTIZED')} on:change={() => toggleStatus('EXTERNAL_BAPTIZED')} class="rounded text-brand-600 focus:ring-brand-500 w-4 h-4" />
                  Baptisé Externe
                </label>
                <label class="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={newTask.allowedStatuses.includes('UNBAPTIZED')} on:change={() => toggleStatus('UNBAPTIZED')} class="rounded text-brand-600 focus:ring-brand-500 w-4 h-4" />
                  Non baptisé
                </label>
              </div>
            </div>

            <div class="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <button type="button" on:click={cancelTaskForm} class="w-full sm:w-auto px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition text-sm">Annuler</button>
              <button type="submit" class="w-full sm:flex-1 bg-brand-600 text-white rounded-xl py-2.5 text-sm font-bold shadow-sm hover:bg-brand-500 transition">{editingTaskId ? 'Enregistrer les modifications' : 'Ajouter la tâche'}</button>
            </div>
          </form>
        {:else}
          <button on:click={() => showTaskForm = true} class="w-full border-2 border-dashed border-slate-300 text-slate-600 rounded-xl py-3 text-sm font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
            Ajouter une tâche
          </button>
        {/if}
      {/if}
    </div>
  </div>

  <!-- SECTION 3 : GÉNÉRATION -->
  <div class="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
    <h2 class="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
      <svg class="text-brand-600" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"></path><path d="M3.34 19a10 10 0 1 1 17.32 0"></path></svg>
      Générer les affectations
    </h2>
    
    <form on:submit={onGenerateAssignments} class="flex flex-col md:flex-row gap-4 items-end bg-slate-50 p-4 rounded-xl border border-slate-100">
      <div class="flex-1 w-full">
        <label class="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Programme</label>
        <select bind:value={selectedProgramForGen} class="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none focus:border-brand-500 bg-white text-sm md:text-base cursor-pointer">
          {#each programs as p}
            <option value={p.id}>{p.name}</option>
          {/each}
        </select>
      </div>
      <div class="flex-1 w-full">
        <label class="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Date de la session</label>
        <input type="date" bind:value={sessionDate} class="w-full border border-slate-300 px-4 py-2.5 rounded-xl outline-none focus:border-brand-500 bg-white text-sm md:text-base" />
      </div>
      <button type="submit" disabled={generating || programs.length === 0} class="w-full md:w-auto bg-brand-600 text-white font-bold px-8 py-2.5 rounded-xl hover:bg-brand-500 transition disabled:opacity-50 shadow-sm flex justify-center items-center gap-2">
        {#if generating}
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Génération...
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          Générer
        {/if}
      </button>
    </form>

    {#if generatedSessionId}
      <div class="mt-8 border-t border-slate-100 pt-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h3 class="font-bold text-slate-800 text-lg">Résultat de la génération</h3>
          
          {#if !isPublished}
            <button on:click={onPublishSession} disabled={isPublishing || assignments.length === 0} class="w-full sm:w-auto bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-green-500 transition disabled:opacity-50 text-sm shadow-sm flex justify-center items-center gap-2">
              {#if isPublishing}
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Publication...
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="11" y1="2" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                Publier ce programme
              {/if}
            </button>
          {:else}
            <span class="w-full sm:w-auto bg-green-50 text-green-700 border border-green-200 font-bold px-4 py-2 rounded-xl text-sm flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Programme publié
            </span>
          {/if}
        </div>

        {#if assignments.length === 0}
          <p class="text-slate-500 text-sm p-4 bg-slate-50 rounded-xl text-center">Aucune affectation générée.</p>
        {:else}
          <!-- Tableau avec défilement horizontal sur mobile -->
          <div class="border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                <tr>
                  <th class="px-5 py-3 font-bold">Tâche</th>
                  <th class="px-5 py-3 font-bold">Membre</th>
                  <th class="px-5 py-3 font-bold">Statut</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 bg-white">
                {#each assignments as a}
                  <tr class="hover:bg-slate-50/50 transition">
                    <td class="px-5 py-3 font-bold text-slate-800">{a.task}</td>
                    <td class="px-5 py-3 text-slate-600 font-medium">{a.member}</td>
                    <td class="px-5 py-3">
                      <span class="text-[10px] font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-md uppercase tracking-wide">{a.status}</span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
