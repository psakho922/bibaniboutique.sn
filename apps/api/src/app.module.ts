/**
 * AUDIT DOC:
 * - Regroupe les modules applicatifs.
 * - Ajoute le guard JWT global si nécessaire (désactivé dans cette démo).
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { PaymentsModule } from './payments/payments.module';
import { IdempotencyModule } from './idempotency/idempotency.module';
import { AuthModule } from './auth/auth.module';
import { ListingsModule } from './listings/listings.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { ChatModule } from './chat/chat.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersController } from './users/users.controller';
import { DemoController } from './demo/demo.controller';

@Module({
  imports: [PrismaModule, PaymentsModule, IdempotencyModule, AuthModule, ListingsModule, MonitoringModule, ChatModule, ReviewsModule],
  controllers: [UsersController, DemoController],
})
export class AppModule {}
