import { Form } from '../../../domain/form/form';
import { FormResponse } from '../../../domain/form/form-response';
import type { FormRow, NewFormRow, FormResponseRow, NewFormResponseRow } from '../schema/form.table';

export function toDomain(row: FormRow): Form {
  return Form.reconstitute({
    id: row.id, churchId: row.churchId, title: row.title, description: row.description,
    audience: row.audience, status: row.status, 
    fields: (row.fields as any) || [], // <-- On s'assure que ce n'est pas undefined
    createdAt: row.createdAt, updatedAt: row.updatedAt,
  });
}
export function toInsert(f: Form): NewFormRow {
  return {
    id: f.id, churchId: f.churchId, title: f.title, description: f.description,
    audience: f.audience, status: f.status, fields: f.fields,
    createdAt: f.createdAt, updatedAt: f.updatedAt,
  };
}

export function responseToDomain(row: FormResponseRow): FormResponse {
  return FormResponse.reconstitute({
    id: row.id, formId: row.formId, memberId: row.memberId,
    data: (row.data as any) || {}, createdAt: row.createdAt,
  });
}
export function responseToInsert(r: FormResponse): NewFormResponseRow {
  return {
    id: r.id, formId: r.formId, memberId: r.memberId,
    data: r.data, createdAt: r.createdAt,
  };
}
