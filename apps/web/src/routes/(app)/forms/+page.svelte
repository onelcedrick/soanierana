<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { listAllForms, createForm, updateForm, deleteForm, publishForm, exportResponses, type Form, type FormField } from '$lib/api/forms';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let forms: Form[] = [];
  let loading = true;
  let message = '';
  let error = '';

  // État du formulaire
  let formData = { title: '', description: '', audience: 'PUBLIC' };
  let fields: FormField[] = [];
  let newField = { label: '', type: 'text' as any, required: true };
  let editingFormId: string | null = null;

  onMount(async () => {
    if (!$auth.token) return goto('/login');
    await load();
  });

  async function load() {
    loading = true;
    try {
      forms = await listAllForms($auth.user!.churchId, $auth.token!);
    } catch (err) { error = 'Erreur chargement'; }
    finally { loading = false; }
  }

  function addField() {
    if (!newField.label) return;
    fields = [...fields, { id: crypto.randomUUID(), label: newField.label, type: newField.type, required: newField.required }];
    newField = { label: '', type: 'text', required: true };
  }

  function removeField(index: number) {
    fields = fields.filter((_, i) => i !== index);
  }

  function startEdit(form: Form) {
    editingFormId = form.id;
    formData = { title: form.title, description: form.description || '', audience: form.audience };
    fields = [...form.fields];
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    editingFormId = null;
    formData = { title: '', description: '', audience: 'PUBLIC' };
    fields = [];
  }

  async function onSubmit(e: Event) {
    e.preventDefault();
    message = ''; error = '';
    
    if (fields.length === 0) {
      error = 'Veuillez ajouter au moins un champ au formulaire.';
      return;
    }

    try {
      if (editingFormId) {
        await updateForm(editingFormId, { ...formData, fields }, $auth.token!);
        message = 'Formulaire modifié avec succès !';
        cancelEdit();
      } else {
        await createForm({ ...formData, churchId: $auth.user!.churchId, fields }, $auth.token!);
        message = 'Formulaire créé avec succès !';
        formData = { title: '', description: '', audience: 'PUBLIC' };
        fields = [];
      }
      await load();
    } catch (err) { 
      error = 'Erreur lors de l\'enregistrement'; 
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce formulaire ? Toutes les réponses associées seront perdues.')) return;
    try {
      await deleteForm(id, $auth.token!);
      message = 'Formulaire supprimé';
      if (editingFormId === id) cancelEdit();
      await load();
    } catch (err) { error = 'Erreur lors de la suppression'; }
  }

  async function onPublish(id: string) {
    try {
      await publishForm(id, $auth.token!);
      await load();
    } catch (err) { error = 'Erreur publication'; }
  }

  async function onExport(id: string) {
    try {
      const blob = await exportResponses(id, $auth.token!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reponses.csv';
      a.click();
    } catch (err) { error = 'Erreur export'; }
  }
</script>

<div class="flex justify-between items-center mb-6">
  <h1 class="text-2xl font-bold">Formulaires d'enquête</h1>
</div>

{#if message}<p class="text-green-700 text-sm mb-3 p-3 bg-green-50 rounded-lg">{message}</p>{/if}
{#if error}<p class="text-red-600 text-sm mb-3 p-3 bg-red-50 rounded-lg">{error}</p>{/if}

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
  
  <!-- Formulaire de création / modification -->
  <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <div class="flex justify-between items-center mb-4">
      <h2 class="font-bold text-lg text-slate-800">
        {editingFormId ? 'Modifier le formulaire' : 'Nouveau formulaire'}
      </h2>
      {#if editingFormId}
        <button type="button" on:click={cancelEdit} class="text-sm text-red-500 hover:underline">Annuler la modification</button>
      {/if}
    </div>
    
    <form on:submit={onSubmit} class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Titre</label>
        <input bind:value={formData.title} required placeholder="Ex: Recensement des compétences" class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500" />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea bind:value={formData.description} rows="2" placeholder="Ex: Remplissez vos spécialités" class="w-full border border-slate-300 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500"></textarea>
      </div>

      <div class="border-t border-slate-100 pt-4">
        <label class="block text-sm font-bold text-slate-800 mb-2">Champs du formulaire</label>
        
        {#if fields.length > 0}
          <ul class="space-y-2 mb-4">
            {#each fields as field, i}
              <li class="flex justify-between items-center bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm">
                <div>
                  <span class="font-bold text-slate-800">{field.label}</span>
                  <span class="text-xs text-slate-500 ml-2">({field.type})</span>
                  {#if field.required}<span class="text-red-500 ml-1">*</span>{/if}
                </div>
                <button type="button" on:click={() => removeField(i)} class="text-red-500 hover:text-red-700 font-bold text-xs">Supprimer</button>
              </li>
            {/each}
          </ul>
        {/if}

        <div class="flex gap-2 items-end bg-blue-50 p-3 rounded-xl border border-blue-100">
          <div class="flex-1">
            <label class="block text-xs font-medium text-slate-700 mb-1">Nom du champ</label>
            <input bind:value={newField.label} placeholder="Ex: Email, Compétences..." class="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm outline-none" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-700 mb-1">Type</label>
            <select bind:value={newField.type} class="border border-slate-300 rounded-lg px-3 py-1.5 text-sm outline-none">
              <option value="text">Texte court</option>
              <option value="email">Email</option>
              <option value="number">Nombre</option>
              <option value="textarea">Texte long</option>
            </select>
          </div>
          <button type="button" on:click={addField} class="bg-brand-600 text-white rounded-lg px-4 py-1.5 text-sm font-medium hover:bg-brand-500">Ajouter</button>
        </div>
      </div>

      <button type="submit" class="w-full {editingFormId ? 'bg-orange-600 hover:bg-orange-500' : 'bg-slate-900 hover:bg-slate-800'} text-white rounded-xl py-3 font-bold mt-4 transition">
        {editingFormId ? 'Enregistrer les modifications' : 'Créer le formulaire'}
      </button>
    </form>
  </div>

  <!-- Liste des formulaires existants -->
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
    <h2 class="font-bold text-lg mb-4 text-slate-800">Formulaires existants</h2>
    {#if loading}
      <p class="text-sm text-slate-500">Chargement...</p>
    {:else if forms.length === 0}
      <p class="text-sm text-slate-500">Aucun formulaire.</p>
    {:else}
      <div class="space-y-3">
        {#each forms as form}
          <div class="border border-slate-200 rounded-xl p-3">
            <div class="flex justify-between items-start">
              <h3 class="font-bold text-sm text-slate-900">{form.title}</h3>
              <span class="text-[10px] px-2 py-0.5 rounded {form.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">{form.status}</span>
            </div>
            <p class="text-xs text-slate-500 mt-1 line-clamp-2">{form.description}</p>
            
            <div class="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-2">
              <button on:click={() => startEdit(form)} class="text-xs font-medium text-blue-600 hover:underline">Modifier</button>
              <button on:click={() => onDelete(form.id)} class="text-xs font-medium text-red-500 hover:underline">Supprimer</button>
              {#if form.status === 'DRAFT'}
                <button on:click={() => onPublish(form.id)} class="text-xs font-medium text-green-600 hover:underline">Publier</button>
              {/if}
              <button on:click={() => onExport(form.id)} class="text-xs font-medium text-slate-500 hover:underline ml-auto">CSV</button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
