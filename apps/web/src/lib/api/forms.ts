import { PUBLIC_API_URL } from '$env/static/public';
import { apiFetch } from './client';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select';
  required: boolean;
  options?: string[];
}

export interface Form { 
  id: string; 
  title: string; 
  description: string; 
  audience: string; 
  status: string; 
  fields: FormField[]; 
}

export function listAllForms(churchId: string, token: string): Promise<Form[]> {
  return apiFetch<Form[]>('/forms/all?churchId=' + churchId, { token });
}

export function listPublicForms(churchId: string): Promise<Form[]> {
  return apiFetch<Form[]>('/forms/public?churchId=' + churchId);
}

export function createForm(input: { churchId: string, title: string, description?: string, audience: string, fields: FormField[] }, token: string) {
  return apiFetch('/forms', { method: 'POST', body: input, token });
}

export function updateForm(id: string, input: { title?: string, description?: string, audience?: string, fields?: FormField[] }, token: string) {
  return apiFetch('/forms/' + id, { method: 'PUT', body: input, token });
}

export function deleteForm(id: string, token: string) {
  return apiFetch('/forms/' + id, { method: 'DELETE', token });
}

export function publishForm(id: string, token: string) {
  return apiFetch('/forms/' + id + '/publish', { method: 'POST', token });
}

export function submitResponse(formId: string, data: Record<string, any>) {
  return apiFetch('/forms/' + formId + '/submit', { method: 'POST', body: { data } });
}

export function exportResponses(formId: string, token: string): Promise<Blob> {
  return fetch(`${PUBLIC_API_URL}/forms/` + formId + '/export', {
    headers: { Authorization: 'Bearer ' + token }
  }).then(res => res.blob());
}
