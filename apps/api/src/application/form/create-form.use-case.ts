import { Form, type FormAudience, type FormField } from '../../domain/form/form';
import type { FormRepository } from '../../domain/form/form.repository';
import type { ChurchRepository } from '../../domain/church/church.repository';
import { NotFoundError } from '../../shared/errors';

export class CreateFormUseCase {
  constructor(private readonly forms: FormRepository, private readonly churches: ChurchRepository) {}
  async execute(input: { churchId: string; title: string; description?: string; audience: FormAudience; fields: FormField[] }) {
    const church = await this.churches.findById(input.churchId);
    if (!church) throw new NotFoundError('Eglise');
    const form = Form.create(input);
    await this.forms.save(form);
    return { id: form.id };
  }
}
