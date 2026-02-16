/**
 * AUDIT DOC:
 * - Implémentation DB de l'idempotence adossée à Prisma.
 * - S'appuie sur le modèle IdempotencyKey (clé, requestHash, statusCode, responseBody).
 */
import { PrismaClient } from '@prisma/client';
import { IdempotencyStore, StoredResponse } from './idempotency.store';

export class PrismaIdempotencyStore implements IdempotencyStore {
  constructor(private prisma: PrismaClient) {}

  async findCompleted(key: string, requestHash: string): Promise<StoredResponse | null> {
    const rec = await this.prisma.idempotencyKey.findFirst({
      where: { key, requestHash, completedAt: { not: null } },
    });
    if (!rec) return null;
    return { statusCode: rec.statusCode ?? 200, body: rec.responseBody ?? null };
  }

  async tryLock(key: string, requestHash: string): Promise<boolean> {
    const now = new Date();
    const existing = await this.prisma.idempotencyKey.findFirst({ where: { key, requestHash } });
    if (existing) {
      if (existing.completedAt) return true;
      if (existing.lockedAt && now.getTime() - existing.lockedAt.getTime() < 60_000) return false;
      await this.prisma.idempotencyKey.update({ where: { id: existing.id }, data: { lockedAt: now } });
      return true;
    }
    await this.prisma.idempotencyKey.create({ data: { key, requestHash, method: '', path: '', lockedAt: now } as any });
    return true;
  }

  async complete(key: string, requestHash: string, statusCode: number, body: any): Promise<void> {
    const rec = await this.prisma.idempotencyKey.findFirst({ where: { key, requestHash } });
    const data = { statusCode, responseBody: body as any, completedAt: new Date(), lockedAt: null } as any;
    if (rec) {
      await this.prisma.idempotencyKey.update({ where: { id: rec.id }, data });
    } else {
      await this.prisma.idempotencyKey.create({ data: { key, requestHash, method: '', path: '', ...data } as any });
    }
  }
}
