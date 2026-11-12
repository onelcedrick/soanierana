import type { FormRepository } from '../../domain/form/form.repository';
import type { FormAudience, FormField } from '../../domain/form/form';
import { NotFoundError } from '../../shared/errors';

export class UpdateFormUseCase {
  constructor(private readonly forms: FormRepository) {}
  async execute(id: string, input: { title?: string; description?: string | null; audience?: FormAudience; fields?: FormField[] }) {
    const form = await this.forms.findById(id);
    if (!form) throw new NotFoundError('Formulaire');
    
    form.update(input);
    await this.forms.update(form);
    
    return { success: true };
  }
}
