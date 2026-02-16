import { Module } from '@nestjs/common';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ListingsController],
  providers: [ListingsService],
})
export class ListingsModule {}
