/**
 * AUDIT DOC:
 * - Adapte Prisma Client au contexte NestJS.
 * - Se connecte au démarrage et expose le client via l'héritage.
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
