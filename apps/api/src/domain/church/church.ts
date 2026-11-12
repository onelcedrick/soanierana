import { InvariantViolationError } from '../shared/errors';
import { generateId } from '../shared/identifier';

interface ChurchProps {
  id: string; name: string; city: string; country: string;
  coverImageUrl: string | null; logoUrl: string | null;
  themeConfig: any | null;
  createdAt: Date; updatedAt: Date;
}

export class Church {
  readonly id: string;
  readonly createdAt: Date;
  private _name: string;
  private _city: string;
  private _country: string;
  private _coverImageUrl: string | null;
  private _logoUrl: string | null;
  private _themeConfig: any | null;
  private _updatedAt: Date;

  private constructor(props: ChurchProps) {
    this.id = props.id; this._name = props.name; this._city = props.city;
    this._country = props.country; this._coverImageUrl = props.coverImageUrl;
    this._logoUrl = props.logoUrl; this._themeConfig = props.themeConfig;
    this.createdAt = props.createdAt; this._updatedAt = props.updatedAt;
  }

  static create(input: { name: string; city: string; country: string }): Church {
    const now = new Date();
    const church = new Church({
      id: generateId(), name: input.name.trim(), city: input.city.trim(),
      country: input.country.trim(), coverImageUrl: null, logoUrl: null, themeConfig: null,
      createdAt: now, updatedAt: now,
    });
    if (!church._name || church._name.length < 2) throw new InvariantViolationError('Nom trop court');
    return church;
  }

  static reconstitute(props: ChurchProps): Church { return new Church(props); }

  updateTheme(config: any): void {
    this._themeConfig = config;
    this._updatedAt = new Date();
  }

  updateBranding(coverImageUrl?: string | null, logoUrl?: string | null): void {
    if (coverImageUrl !== undefined) this._coverImageUrl = coverImageUrl;
    if (logoUrl !== undefined) this._logoUrl = logoUrl;
    this._updatedAt = new Date();
  }

  get name(): string { return this._name; }
  get city(): string { return this._city; }
  get country(): string { return this._country; }
  get coverImageUrl(): string | null { return this._coverImageUrl; }
  get logoUrl(): string | null { return this._logoUrl; }
  get themeConfig(): any | null { return this._themeConfig; }
  get updatedAt(): Date { return this._updatedAt; }
}
