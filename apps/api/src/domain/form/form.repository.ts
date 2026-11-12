import type { Form } from './form';
import type { FormResponse } from './form-response';

export interface FormRepository {
  findById(id: string): Promise<Form | null>;
  findByChurch(churchId: string): Promise<Form[]>;
  save(form: Form): Promise<void>;
  update(form: Form): Promise<void>;
  delete(id: string): Promise<void>;
  
  saveResponse(response: FormResponse): Promise<void>;
  findResponsesByForm(formId: string): Promise<FormResponse[]>;
}
