import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.listing.findMany({
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            // In real app, name/avatar
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    if (!listing) throw new NotFoundException('Annonce non trouvée');
    return listing;
  }

  // Basic CRUD for sellers
  async create(userId: string, data: any) {
    return this.prisma.listing.create({
      data: {
        ...data,
        sellerId: userId,
      },
    });
  }
}
