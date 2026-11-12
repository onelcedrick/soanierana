import { eq } from 'drizzle-orm';
import type { Form } from '../../domain/form/form';
import type { FormResponse } from '../../domain/form/form-response';
import type { FormRepository } from '../../domain/form/form.repository';
import type { Db } from '../database/client';
import { forms, formResponses } from '../database/schema/form.table';
import { toDomain, toInsert, responseToDomain, responseToInsert } from '../database/mappers/form.mapper';

export class DrizzleFormRepository implements FormRepository {
  constructor(private readonly db: Db) {}

  async findById(id: string): Promise<Form | null> {
    const [row] = await this.db.select().from(forms).where(eq(forms.id, id)).limit(1);
    return row ? toDomain(row) : null;
  }

  async findByChurch(churchId: string): Promise<Form[]> {
    const rows = await this.db.select().from(forms).where(eq(forms.churchId, churchId));
    return rows.map(toDomain);
  }

  async save(f: Form): Promise<void> {
    await this.db.insert(forms).values(toInsert(f));
  }

  async update(f: Form): Promise<void> {
    await this.db.update(forms).set(toInsert(f)).where(eq(forms.id, f.id));
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(forms).where(eq(forms.id, id));
  }

  async saveResponse(r: FormResponse): Promise<void> {
    await this.db.insert(formResponses).values(responseToInsert(r));
  }

  async findResponsesByForm(formId: string): Promise<FormResponse[]> {
    const rows = await this.db.select().from(formResponses).where(eq(formResponses.formId, formId));
    return rows.map(responseToDomain);
  }
}
