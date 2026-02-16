import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.user.findMany({ select: { id: true, email: true, role: true, createdAt: true }, orderBy: { createdAt: 'desc' } });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        phone: true,
        kycStatus: true,
        createdAt: true,
        listings: {
          select: { id: true, title: true, priceCfa: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
        intentsBought: {
          select: { id: true, amountCfa: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
        intentsSold: {
          select: { id: true, amountCfa: true, status: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        }
      },
    });
    return user;
  }
}
