<script lang="ts">
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
    if (!confirm('Supprimer ce programme et toutes ses tâches ?')) return;
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
    if (!confirm('Supprimer cette tâche ?')) return;
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
    if (!confirm('Une fois publié, ces membres seront occupés pour le reste de la semaine. Confirmer ?')) return;
    
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

<div class="max-w-6xl mx-auto space-y-8">
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Programmes & Tâches</h1>
    <p class="text-slate-500 mt-1">Configurez vos programmes, ajoutez des rôles et générez les affectations.</p>
  </div>

  {#if message}<div class="bg-green-50 text-green-700 p-3 rounded-lg border border-green-200">{message}</div>{/if}
  {#if error}<div class="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200">{error}</div>{/if}

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    
    <!-- SECTION 1 : CRÉER UN PROGRAMME -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 class="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
        <svg class="text-brand-600" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
        Nouveau Programme
      </h2>
      <form on:submit={onCreateProgram} class="space-y-3">
        <input bind:value={newProgram.name} required placeholder="Ex: Culte du Mercredi" class="w-full border px-3 py-2 rounded-lg" />
        <div class="grid grid-cols-2 gap-3">
          <select bind:value={newProgram.frequency} class="border px-3 py-2 rounded-lg bg-slate-50">
            <option value="WEEKLY">Hebdomadaire</option>
            <option value="BIWEEKLY">Bimensuel</option>
          </select>
          <select bind:value={newProgram.dayOfWeek} class="border px-3 py-2 rounded-lg bg-slate-50">
            <option value={0}>Dimanche</option>
            <option value={1}>Lundi</option>
            <option value={2}>Mardi</option>
            <option value={3}>Mercredi</option>
            <option value={4}>Jeudi</option>
            <option value={5}>Vendredi</option>
            <option value={6}>Samedi</option>
          </select>
        </div>
        <button type="submit" class="w-full bg-slate-900 text-white font-medium rounded-lg py-2">Créer le programme</button>
      </form>
    </div>

    <!-- SECTION 2 : GESTION DES TÂCHES -->
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 class="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
        <svg class="text-brand-600" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        Tâches du programme
      </h2>
      
      <div class="flex gap-2 mb-4">
        <select value={selectedProgramForTasks} on:change={(e) => { selectedProgramForTasks = (e.target as HTMLSelectElement).value; loadTasks(selectedProgramForTasks); }} class="flex-1 border px-3 py-2 rounded-lg bg-slate-50 font-medium">
          {#each programs as p}
            <option value={p.id}>{p.name}</option>
          {/each}
        </select>
        {#if selectedProgramForTasks}
          <button on:click={onDeleteProgram} class="bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition" title="Supprimer le programme">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        {/if}
      </div>

      {#if loadingTasks}
        <p class="text-sm text-slate-500">Chargement...</p>
      {:else}
        <ul class="space-y-2 mb-4">
          {#each tasks as t}
            <li class="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm group">
              <div class="flex items-center gap-2">
                <span class="font-medium">{t.name} ({t.requiredPeople} pers.)</span>
                {#if t.minimumGrade}<span class="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">{t.minimumGrade}</span>{/if}
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button on:click={() => startEditTask(t)} class="text-slate-400 hover:text-brand-600 p-1" title="Modifier">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button on:click={() => onDeleteTask(t.id)} class="text-slate-400 hover:text-red-600 p-1" title="Supprimer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </li>
          {/each}
        </ul>

        {#if showTaskForm}
          <form on:submit={onSubmitTask} class="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3">
            <input bind:value={newTask.name} required placeholder="Nom de la tâche" class="w-full border px-3 py-2 rounded-lg" />
            <div class="grid grid-cols-2 gap-2">
              <input type="number" bind:value={newTask.requiredPeople} min="1" class="border px-3 py-2 rounded-lg" />
              <select bind:value={newTask.minimumGrade} class="border px-3 py-2 rounded-lg bg-white">
                <option value="">Membre (aucun grade)</option>
                <option value="DIAKONA">Diacre requis</option>
                <option value="LOHOLONA">Loholona requis</option>
              </select>
            </div>
            
            <div class="bg-white p-2 rounded-lg border border-slate-200">
              <p class="text-xs font-bold text-slate-600 mb-2 uppercase">Qui peut participer ?</p>
              <div class="flex flex-wrap gap-3">
                <label class="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={newTask.allowedStatuses.includes('LOCAL_BAPTIZED')} on:change={() => toggleStatus('LOCAL_BAPTIZED')} class="rounded border-slate-300" />
                  Baptisé Local
                </label>
                <label class="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={newTask.allowedStatuses.includes('EXTERNAL_BAPTIZED')} on:change={() => toggleStatus('EXTERNAL_BAPTIZED')} class="rounded border-slate-300" />
                  Baptisé Externe
                </label>
                <label class="flex items-center gap-1.5 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={newTask.allowedStatuses.includes('UNBAPTIZED')} on:change={() => toggleStatus('UNBAPTIZED')} class="rounded border-slate-300" />
                  Non baptisé
                </label>
              </div>
            </div>

            <div class="flex gap-2">
              <button type="submit" class="flex-1 bg-brand-600 text-white rounded-lg py-2 text-sm font-medium">{editingTaskId ? 'Enregistrer' : 'Ajouter'}</button>
              <button type="button" on:click={cancelTaskForm} class="px-4 text-slate-500 text-sm">Annuler</button>
            </div>
          </form>
        {:else}
          <button on:click={() => showTaskForm = true} class="w-full border-2 border-dashed border-slate-300 text-slate-600 rounded-lg py-2 text-sm font-medium hover:bg-slate-50 transition">
            + Ajouter une tâche
          </button>
        {/if}
      {/if}
    </div>
  </div>

  <!-- SECTION 3 : GÉNÉRATION -->
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <h2 class="font-bold text-lg mb-4 text-slate-800">Générer les affectations</h2>
    <form on:submit={onGenerateAssignments} class="flex flex-col md:flex-row gap-4 items-end">
      <div class="flex-1 w-full">
        <label class="block text-xs font-medium text-slate-500 mb-1">Programme</label>
        <select bind:value={selectedProgramForGen} class="w-full border px-3 py-2.5 rounded-lg bg-slate-50">
          {#each programs as p}
            <option value={p.id}>{p.name}</option>
          {/each}
        </select>
      </div>
      <div class="flex-1 w-full">
        <label class="block text-xs font-medium text-slate-500 mb-1">Date</label>
        <input type="date" bind:value={sessionDate} class="w-full border px-3 py-2.5 rounded-lg bg-slate-50" />
      </div>
      <button type="submit" disabled={generating || programs.length === 0} class="bg-brand-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-brand-500 transition disabled:opacity-50 w-full md:w-auto">
        {generating ? 'Génération...' : 'Générer'}
      </button>
    </form>

    {#if generatedSessionId}
      <div class="mt-8">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-bold text-slate-800">Résultat</h3>
          {#if !isPublished}
            <button on:click={onPublishSession} disabled={isPublishing || assignments.length === 0} class="bg-green-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-500 transition disabled:opacity-50 text-sm">
              {isPublishing ? 'Publication...' : 'Publier ce programme'}
            </button>
          {:else}
            <span class="bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Publié
            </span>
          {/if}
        </div>

        {#if assignments.length === 0}
          <p class="text-slate-500 text-sm">Aucune affectation générée.</p>
        {:else}
          <div class="border rounded-xl overflow-hidden">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 text-slate-600">
                <tr>
                  <th class="px-4 py-2">Tâche</th>
                  <th class="px-4 py-2">Membre</th>
                  <th class="px-4 py-2">Statut</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                {#each assignments as a}
                  <tr>
                    <td class="px-4 py-2 font-medium">{a.task}</td>
                    <td class="px-4 py-2">{a.member}</td>
                    <td class="px-4 py-2 text-xs font-bold text-yellow-600">{a.status}</td>
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
