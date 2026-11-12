import { Poll } from '../../../domain/poll/poll';
import { PollOption } from '../../../domain/poll/poll-option';
import type { PollRow, NewPollRow, PollOptionRow, NewPollOptionRow } from '../schema/poll.table';

export function toDomain(row: PollRow): Poll {
  return Poll.reconstitute({
    id: row.id, churchId: row.churchId, title: row.title, description: row.description,
    audience: row.audience, isAnonymous: row.isAnonymous, isMultipleChoice: row.isMultipleChoice,
    opensAt: row.opensAt, closesAt: row.closesAt, status: row.status,
    showResultsBeforeClose: row.showResultsBeforeClose,
    createdAt: row.createdAt, updatedAt: row.updatedAt,
  });
}
export function toInsert(p: Poll): NewPollRow {
  return {
    id: p.id, churchId: p.churchId, title: p.title, description: p.description,
    audience: p.audience, isAnonymous: p.isAnonymous, isMultipleChoice: p.isMultipleChoice,
    opensAt: p.opensAt, closesAt: p.closesAt, status: p.status,
    showResultsBeforeClose: p.showResultsBeforeClose,
    createdAt: p.createdAt, updatedAt: p.updatedAt,
  };
}
export function optionToDomain(row: PollOptionRow): PollOption {
  return PollOption.reconstitute({ id: row.id, pollId: row.pollId, label: row.label, position: row.position });
}
export function optionToInsert(o: PollOption): NewPollOptionRow {
  return { id: o.id, pollId: o.pollId, label: o.label, position: o.position };
}
