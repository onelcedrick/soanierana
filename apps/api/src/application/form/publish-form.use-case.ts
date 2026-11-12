import type { FormRepository } from '../../domain/form/form.repository';
import { NotFoundError } from '../../shared/errors';

export class PublishFormUseCase {
  constructor(private readonly forms: FormRepository) {}
  async execute(id: string) {
    const form = await this.forms.findById(id);
    if (!form) throw new NotFoundError('Formulaire');
    form.publish();
    await this.forms.update(form);
    return { id: form.id, status: form.status };
  }
}
