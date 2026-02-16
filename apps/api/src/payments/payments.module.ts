/**
 * AUDIT DOC:
 * - Déclare le service et le contrôleur de paiements.
 */
import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { IdempotencyModule } from '../idempotency/idempotency.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, IdempotencyModule, AuthModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
