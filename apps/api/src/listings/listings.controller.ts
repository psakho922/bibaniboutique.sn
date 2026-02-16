import { Body, Controller, Get, Param, Post, UseGuards, Request } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('listings')
export class ListingsController {
  constructor(private listingsService: ListingsService) {}

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
}
