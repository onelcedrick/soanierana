import { generateId } from '../shared/identifier';

interface FormResponseProps {
  id: string; formId: string; memberId: string | null;
  data: Record<string, any>; createdAt: Date;
}

export class FormResponse {
  readonly id: string;
  readonly formId: string;
  readonly memberId: string | null;
  readonly data: Record<string, any>;
  readonly createdAt: Date;

  private constructor(props: FormResponseProps) {
    this.id = props.id; this.formId = props.formId; this.memberId = props.memberId;
    this.data = props.data; this.createdAt = props.createdAt;
  }

  static create(input: { formId: string; memberId?: string | null; data: Record<string, any>; }): FormResponse {
    return new FormResponse({
      id: generateId(), formId: input.formId, memberId: input.memberId ?? null,
      data: input.data, createdAt: new Date(),
    });
  }

  static reconstitute(props: FormResponseProps): FormResponse { return new FormResponse(props); }
}
