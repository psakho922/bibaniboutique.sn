import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(reviewerId: string, data: { listingId: string; rating: number; comment?: string }) {
    // 1. Check if listing exists
    const listing = await this.prisma.listing.findUnique({
      where: { id: data.listingId },
      include: { seller: true }
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.sellerId === reviewerId) {
      throw new BadRequestException('Cannot review your own listing');
    }

    // 2. Check if user actually bought this listing (optional, but good for marketplaces)
    // For now, we allow any user to review any seller's listing if they interacted.
    // Ideally, we check PaymentIntent status.
    const purchase = await this.prisma.paymentIntent.findFirst({
      where: {
        listingId: data.listingId,
        buyerId: reviewerId,
        status: 'CAPTURED' // Only after successful purchase
      }
    });

    if (!purchase) {
      // Allow review if just confirmed? Or maybe restrict to buyers.
      // Let's restrict to verified buyers for quality.
      throw new BadRequestException('You must purchase the item to review it');
    }

    // 3. Check if already reviewed
    const existing = await this.prisma.review.findFirst({
      where: {
        listingId: data.listingId,
        reviewerId
      }
    });

    if (existing) {
      throw new BadRequestException('You have already reviewed this listing');
    }

    return this.prisma.review.create({
      data: {
        reviewerId,
        targetId: listing.sellerId,
        listingId: data.listingId,
        rating: data.rating,
        comment: data.comment
      }
    });
  }

  async getSellerReviews(sellerId: string) {
    return this.prisma.review.findMany({
      where: { targetId: sellerId },
      include: {
        reviewer: { select: { id: true, email: true } },
        listing: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getMyReviews(userId: string) {
    return this.prisma.review.findMany({
      where: { reviewerId: userId },
      include: {
        target: { select: { email: true } },
        listing: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
