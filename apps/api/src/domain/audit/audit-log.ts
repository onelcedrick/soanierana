import { generateId } from '../shared/identifier';
import { createHash } from 'node:crypto';

export type LogSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

interface AuditLogProps {
  id: string; churchId: string; actorId: string;
  action: string; module: string; entityId: string | null;
  description: string; oldValue: any | null; newValue: any | null;
  severity: LogSeverity; ipAddress: string | null;
  correlationId: string | null; createdAt: Date;
  hash: string; previousHash: string | null;
}

export class AuditLog {
  readonly id: string;
  readonly churchId: string;
  readonly actorId: string;
  readonly action: string;
  readonly module: string;
  readonly entityId: string | null;
  readonly description: string;
  readonly oldValue: any | null;
  readonly newValue: any | null;
  readonly severity: LogSeverity;
  readonly ipAddress: string | null;
  readonly correlationId: string | null;
  readonly createdAt: Date;
  readonly hash: string;
  readonly previousHash: string | null;

  private constructor(props: AuditLogProps) {
    this.id = props.id; this.churchId = props.churchId; this.actorId = props.actorId;
    this.action = props.action; this.module = props.module; this.entityId = props.entityId;
    this.description = props.description; this.oldValue = props.oldValue; this.newValue = props.newValue;
    this.severity = props.severity; this.ipAddress = props.ipAddress; this.correlationId = props.correlationId;
    this.createdAt = props.createdAt; this.hash = props.hash; this.previousHash = props.previousHash;
  }

  // Méthode statique pour créer un log et calculer son hash (Hash Chain)
  static create(input: {
    churchId: string; actorId: string; action: string; module: string;
    entityId?: string | null; description: string;
    oldValue?: any | null; newValue?: any | null;
    severity: LogSeverity; ipAddress?: string | null; correlationId?: string | null;
    previousHash: string | null;
  }): AuditLog {
    const id = generateId();
    const createdAt = new Date();
    
    // Données à hasher
    const payload = {
      id, churchId: input.churchId, actorId: input.actorId,
      action: input.action, module: input.module, entityId: input.entityId,
      description: input.description, createdAt: createdAt.toISOString()
    };

    // H_n = SHA256(H_{n-1} + Data_n)
    const dataToHash = (input.previousHash || '') + JSON.stringify(payload);
    const hash = createHash('sha256').update(dataToHash).digest('hex');

    return new AuditLog({
      id, churchId: input.churchId, actorId: input.actorId,
      action: input.action, module: input.module, entityId: input.entityId ?? null,
      description: input.description, oldValue: input.oldValue ?? null, newValue: input.newValue ?? null,
      severity: input.severity, ipAddress: input.ipAddress ?? null, correlationId: input.correlationId ?? null,
      createdAt, hash, previousHash: input.previousHash
    });
  }

  static reconstitute(props: AuditLogProps): AuditLog { return new AuditLog(props); }
}
