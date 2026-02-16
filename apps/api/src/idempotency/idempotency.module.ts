/**
 * AUDIT DOC:
 * - Fournit le stockage Prisma pour l'idempotence et exporte l'interceptor.
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { IDEMPOTENCY_STORE } from './idempotency.store';
import { PrismaIdempotencyStore } from './prisma-idempotency.store';
import { IdempotencyInterceptor } from './idempotency.interceptor';

@Module({
  imports: [PrismaModule],
  providers: [
    IdempotencyInterceptor,
    {
      provide: IDEMPOTENCY_STORE,
      useFactory: (prisma: PrismaService) => new PrismaIdempotencyStore(prisma as any),
      inject: [PrismaService],
    },
  ],
  exports: [IDEMPOTENCY_STORE, IdempotencyInterceptor],
})
export class IdempotencyModule {}
