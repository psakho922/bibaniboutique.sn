/**
 * AUDIT DOC:
 * - Endpoints de démo pour semer des données (users + listing) afin d'illustrer le flux.
 */
import { Controller, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Controller('demo')
export class DemoController {
  constructor(private prisma: PrismaService) {}

  @Post('seed')
  async seed() {
    const p: any = this.prisma as any;
    const sellerEmail = `seller_${Math.floor(Math.random() * 100000)}@demo.local`;
    const buyerEmail = `buyer_${Math.floor(Math.random() * 100000)}@demo.local`;
    const seller = await p.user.create({ data: { email: sellerEmail, password: randomUUID(), role: 'SELLER' } });
    const buyer = await p.user.create({ data: { email: buyerEmail, password: randomUUID(), role: 'USER' } });
    const listing = await p.listing.create({
      data: { title: 'Demo Item', priceCfa: 10000, sellerId: seller.id },
    });
    return { seller, buyer, listing };
  }
}
