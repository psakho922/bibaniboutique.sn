import { Controller, Get, Put, UseGuards, Request, ForbiddenException, Body, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KycStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Put('me/profile')
  async updateProfile(@Request() req: any, @Body() body: { phone?: string; password?: string; role?: 'SELLER'; kycStatus?: 'PENDING' }) {
    const data: any = {};
    if (body.phone) data.phone = body.phone;
    if (body.password) {
      data.password = await bcrypt.hash(body.password, 10);
    }
    if (body.role === 'SELLER') data.role = 'SELLER';
    if (body.kycStatus === 'PENDING') data.kycStatus = 'PENDING';
    
    return this.prisma.user.update({
      where: { id: req.user.userId },
      data,
      select: { id: true, email: true, phone: true, role: true, kycStatus: true }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/block')
  async toggleBlock(@Request() req: any, @Param('id') id: string, @Body() body: { isBlocked: boolean }) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
    return this.prisma.user.update({
      where: { id },
      data: { isBlocked: body.isBlocked }
    });
  }

  @Get(':id/public')
  async getPublicProfile(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        kycStatus: true,
        createdAt: true,
        role: true
      }
    });
    
    if (!user) {
      throw new ForbiddenException('User not found'); // Or NotFoundException
    }
    
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Request() req: any) {
    // Basic RBAC check
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
    return this.prisma.user.findMany({ 
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        kycStatus: true,
        isBlocked: true,
        createdAt: true,
        _count: {
          select: { listings: true, intentsBought: true, intentsSold: true }
        }
      }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/kyc')
  async updateKyc(@Request() req: any, @Param('id') id: string, @Body() body: { status: KycStatus }) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
    return this.prisma.user.update({
      where: { id },
      data: { kycStatus: body.status }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        phoneVerified: true,
        role: true,
        phone: true,
        kycStatus: true,
        createdAt: true,
        listings: {
          select: { 
            id: true, 
            title: true, 
            priceCfa: true, 
            createdAt: true,
            status: true,
            intents: {
              select: { status: true },
              take: 1,
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { createdAt: 'desc' },
        },
        intentsBought: {
          select: { 
            id: true, 
            amountCfa: true, 
            status: true, 
            createdAt: true,
            listing: {
              select: { title: true, images: true, seller: { select: { email: true } } }
            }
          },
          orderBy: { createdAt: 'desc' },
        },
        intentsSold: {
          select: { 
            id: true, 
            amountCfa: true, 
            status: true, 
            createdAt: true,
            listing: {
              select: { title: true, images: true }
            }
          },
          orderBy: { createdAt: 'desc' },
        }
      },
    });
    return user;
  }


}
