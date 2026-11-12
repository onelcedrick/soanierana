import type { FormRepository } from '../../domain/form/form.repository';

export class ListFormsUseCase {
  constructor(private readonly forms: FormRepository) {}
  async execute(churchId: string) {
    const list = await this.forms.findByChurch(churchId);
    return list.map((f) => ({
      id: f.id,
      title: f.title,
      description: f.description,
      audience: f.audience,
      status: f.status,
      fields: f.fields || [], // <-- On s'assure de toujours renvoyer un tableau
    }));
  }
}
