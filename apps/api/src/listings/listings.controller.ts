import { Body, Controller, Get, Param, Post, Put, Delete, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('listings')
export class ListingsController {
  constructor(private listingsService: ListingsService) {}

  @Get('my-listings')
  @UseGuards(JwtAuthGuard)
  async getMyListings(@Request() req: any) {
    if (req.user.role !== 'SELLER' && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Seller access required');
    }
    return this.listingsService.findUserListings(req.user.userId);
  }

  @Get('seller/:sellerId')
  async getSellerListings(@Param('sellerId') sellerId: string) {
    return this.listingsService.findSellerListings(sellerId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  async adminFindAll(@Request() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
    return this.listingsService.findAllAdmin();
  }

  @Get()
  findAll() {
    return this.listingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() body: any) {
    return this.listingsService.create(req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.listingsService.update(req.user.userId, req.user.role, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.listingsService.delete(req.user.userId, req.user.role, id);
  }
}
