import type { FormRepository } from '../../domain/form/form.repository';
import { NotFoundError } from '../../shared/errors';

export class ExportResponsesUseCase {
  constructor(private readonly forms: FormRepository) {}
  async execute(formId: string): Promise<string> {
    const form = await this.forms.findById(formId);
    if (!form) throw new NotFoundError('Formulaire');
    
    const responses = await this.forms.findResponsesByForm(formId);
    
    // Créer les en-têtes dynamiquement en fonction des champs du formulaire
    const headers = form.fields.map(f => f.label);
    headers.push('Date de soumission');
    
    const rows = responses.map(r => {
      const rowData = form.fields.map(f => String(r.data[f.id] || ''));
      rowData.push(r.createdAt.toLocaleDateString('fr-FR'));
      return rowData;
    });

    return [headers, ...rows].map(e => e.join(';')).join('\n');
  }
}
