import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ListingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.listing.findMany({
      where: { status: 'ACTIVE' },
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

  async findAllAdmin() {
    return this.prisma.listing.findMany({
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            isBlocked: true,
            kycStatus: true,
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

  async findUserListings(userId: string) {
    return this.prisma.listing.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findSellerListings(sellerId: string) {
    return this.prisma.listing.findMany({
      where: { 
        sellerId,
        // status: 'ACTIVE' // Commented out until ListingStatus is fully integrated/migrated if needed
      },
      include: {
        seller: {
          select: { id: true, email: true, kycStatus: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Basic CRUD for sellers
  async create(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    if (user.isBlocked) throw new ForbiddenException('Compte bloqué');
    if (user.role !== 'SELLER' && user.role !== 'ADMIN') throw new ForbiddenException('Rôle vendeur requis');

    return this.prisma.listing.create({
      data: {
        ...data,
        sellerId: userId,
        status: 'ACTIVE', // Default status
      },
    });
  }

  async update(userId: string, userRole: string, listingId: string, data: any) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Annonce non trouvée');

    if (userRole !== 'ADMIN') {
      if (listing.sellerId !== userId) throw new ForbiddenException('Non autorisé');
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.isBlocked) throw new ForbiddenException('Compte bloqué');
    }

    return this.prisma.listing.update({
      where: { id: listingId },
      data,
    });
  }

  async delete(userId: string, userRole: string, listingId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('Annonce non trouvée');

    if (userRole !== 'ADMIN') {
      if (listing.sellerId !== userId) throw new ForbiddenException('Non autorisé');
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.isBlocked) throw new ForbiddenException('Compte bloqué');
    }

    return this.prisma.listing.delete({ where: { id: listingId } });
  }
}
