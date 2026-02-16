/**
 * AUDIT DOC:
 * - Fournit PrismaService au reste de l'application.
 */
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
