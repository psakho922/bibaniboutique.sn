/**
 * AUDIT DOC:
 * - Stockage idempotence en mémoire pour tests et démos.
 */
import { IdempotencyStore, StoredResponse } from './idempotency.store';

type Entry = { key: string; hash: string; locked: boolean; completed?: StoredResponse };

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private entries: Entry[] = [];

  async findCompleted(key: string, requestHash: string): Promise<StoredResponse | null> {
    const e = this.entries.find((x) => x.key === key && x.hash === requestHash && x.completed);
    return e?.completed ?? null;
  }

  async tryLock(key: string, requestHash: string): Promise<boolean> {
    const existing = this.entries.find((x) => x.key === key && x.hash === requestHash);
    if (existing) {
      if (existing.completed) return true;
      if (existing.locked) return false;
      existing.locked = true;
      return true;
    }
    this.entries.push({ key, hash: requestHash, locked: true });
    return true;
  }

  async complete(key: string, requestHash: string, statusCode: number, body: any): Promise<void> {
    const e = this.entries.find((x) => x.key === key && x.hash === requestHash);
    if (e) {
      e.completed = { statusCode, body };
      e.locked = false;
    } else {
      this.entries.push({ key, hash: requestHash, locked: false, completed: { statusCode, body } });
    }
  }
}
