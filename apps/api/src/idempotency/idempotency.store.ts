/**
 * AUDIT DOC:
 * - Abstraction de stockage pour l'idempotence.
 * - Implémentations: PrismaIdempotencyStore (prod) et InMemoryIdempotencyStore (tests).
 */
export type StoredResponse = { statusCode: number; body: any };

export interface IdempotencyStore {
  findCompleted(key: string, requestHash: string): Promise<StoredResponse | null>;
  tryLock(key: string, requestHash: string): Promise<boolean>;
  complete(key: string, requestHash: string, statusCode: number, body: any): Promise<void>;
}

export const IDEMPOTENCY_STORE = 'IDEMPOTENCY_STORE';
