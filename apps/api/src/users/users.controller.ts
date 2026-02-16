/**
 * AUDIT DOC:
 * - Lecture simple des utilisateurs (id, email, role, createdAt).
 */
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list() {
    const p: any = this.prisma as any;
    return p.user.findMany({ select: { id: true, email: true, role: true, createdAt: true }, orderBy: { createdAt: 'desc' } });
  }
}
