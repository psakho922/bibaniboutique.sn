import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MonitoringService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    // 1. User Stats
    const totalUsers = await this.prisma.user.count();
    const newUsersToday = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    // 2. Listing Stats
    const totalListings = await this.prisma.listing.count();
    // Count listings that have a CAPTURED payment intent (sold)
    const soldListings = await this.prisma.paymentIntent.count({
      where: {
        status: 'CAPTURED',
      },
    });
    const activeListings = totalListings - soldListings;

    // 3. Payment Stats
    const totalVolume = await this.prisma.paymentIntent.aggregate({
      _sum: {
        amountCfa: true,
      },
      where: {
        status: 'CAPTURED',
      },
    });

    // Recent Activity (combine user creation and payment intents)
    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, createdAt: true, role: true },
    });

    const recentPayments = await this.prisma.paymentIntent.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { select: { email: true } },
        listing: { select: { title: true } },
      },
    });

    // Merge and sort
    const activity = [
      ...recentUsers.map(u => ({
        type: 'USER_JOINED',
        id: u.id,
        user: u.email,
        date: u.createdAt,
        details: `Role: ${u.role}`,
      })),
      ...recentPayments.map(p => ({
        type: 'PAYMENT',
        id: p.id,
        user: p.buyer.email,
        date: p.createdAt,
        details: `${p.status} - ${p.amountCfa} CFA - ${p.listing.title}`,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    return {
      users: {
        total: totalUsers,
        newToday: newUsersToday,
      },
      listings: {
        total: totalListings,
        active: activeListings,
        sold: soldListings,
      },
      payments: {
        volume: totalVolume._sum.amountCfa || 0,
      },
      activity,
      system: {
        uptime: process.uptime(),
        timestamp: new Date(),
      },
    };
  }
}
