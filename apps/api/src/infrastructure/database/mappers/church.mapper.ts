import { Church } from '../../../domain/church/church';
import type { ChurchRow, NewChurchRow } from '../schema/church.table';

export function toDomain(row: ChurchRow): Church {
  return Church.reconstitute({
    id: row.id, name: row.name, city: row.city, country: row.country,
    coverImageUrl: row.coverImageUrl, logoUrl: row.logoUrl, themeConfig: row.themeConfig,
    createdAt: row.createdAt, updatedAt: row.updatedAt,
  });
}

export function toInsert(church: Church): NewChurchRow {
  return {
    id: church.id, name: church.name, city: church.city, country: church.country,
    coverImageUrl: church.coverImageUrl, logoUrl: church.logoUrl, themeConfig: church.themeConfig,
    createdAt: church.createdAt, updatedAt: church.updatedAt,
  };
}
