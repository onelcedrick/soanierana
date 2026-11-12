import type { FormRepository } from '../../domain/form/form.repository';
import { NotFoundError } from '../../shared/errors';

export class DeleteFormUseCase {
  constructor(private readonly forms: FormRepository) {}
  async execute(id: string) {
    const form = await this.forms.findById(id);
    if (!form) throw new NotFoundError('Formulaire');
    
    await this.forms.delete(id);
    return { success: true };
  }
}
