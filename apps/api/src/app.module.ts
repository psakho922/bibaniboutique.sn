/**
 * AUDIT DOC:
 * - Regroupe les modules applicatifs.
 * - Ajoute le guard JWT global si nécessaire (désactivé dans cette démo).
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PaymentsModule } from './payments/payments.module';
import { IdempotencyModule } from './idempotency/idempotency.module';
import { UsersController } from './users/users.controller';
import { DemoController } from './demo/demo.controller';

@Module({
  imports: [PrismaModule, PaymentsModule, IdempotencyModule],
  controllers: [UsersController, DemoController],
})
export class AppModule {}
