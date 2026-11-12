import { z } from 'zod';

export const MembershipStatusSchema = z.enum([
  'LOCAL_BAPTIZED',
  'EXTERNAL_BAPTIZED',
  'UNBAPTIZED',
]);
export type MembershipStatus = z.infer<typeof MembershipStatusSchema>;

export const ResponsibilityLevelSchema = z.enum([
  'LOHOLONA',
  'DIAKONA',
  'MAMBRA_TSOTRA',
]);
export type ResponsibilityLevel = z.infer<typeof ResponsibilityLevelSchema>;

export const AssignmentStatusSchema = z.enum([
  'PROPOSED',
  'ACCEPTED',
  'DECLINED',
  'REPLACED',
  'ATTENDED',
  'ABSENT',
]);
export type AssignmentStatus = z.infer<typeof AssignmentStatusSchema>;

export const PollStatusSchema = z.enum([
  'DRAFT',
  'PUBLISHED',
  'CLOSED',
  'ARCHIVED',
]);
export type PollStatus = z.infer<typeof PollStatusSchema>;

export const PublicationStatusSchema = z.enum([
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED',
]);
export type PublicationStatus = z.infer<typeof PublicationStatusSchema>;

export const AudienceSchema = z.enum(['PUBLIC', 'MEMBERS_ONLY']);
export type Audience = z.infer<typeof AudienceSchema>;
