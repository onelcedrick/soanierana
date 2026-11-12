import { FormResponse } from '../../domain/form/form-response';
import type { FormRepository } from '../../domain/form/form.repository';
import { ConflictError, NotFoundError } from '../../shared/errors';

export class SubmitResponseUseCase {
  constructor(private readonly forms: FormRepository) {}
  async execute(input: { formId: string; data: Record<string, any>; memberId?: string | null }) {
    const form = await this.forms.findById(input.formId);
    if (!form) throw new NotFoundError('Formulaire');
    if (form.status !== 'PUBLISHED') throw new ConflictError('Formulaire non ouvert');
    
    const response = FormResponse.create(input);
    await this.forms.saveResponse(response);
    return { id: response.id };
  }
}
