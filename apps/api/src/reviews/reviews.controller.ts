import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() body: { listingId: string; rating: number; comment?: string }) {
    return this.reviewsService.create(req.user.userId, body);
  }

  @Get('seller/:sellerId')
  async getSellerReviews(@Param('sellerId') sellerId: string) {
    return this.reviewsService.getSellerReviews(sellerId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-reviews')
  async getMyReviews(@Request() req: any) {
    return this.reviewsService.getMyReviews(req.user.userId);
  }
}
