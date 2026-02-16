/**
 * AUDIT DOC (débutant):
 * - Implémente create/confirm/capture/refund sur PaymentIntent
 * - Double écriture via LedgerEntry (debit/crédit symétriques)
 * - Idempotence gérée côté contrôleur (clé sur PaymentIntent.idempotencyKey)
 */
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type Ensure = { escrowId: string; feesId: string; pspId: string; sellerAccountId: string };

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  private split(amountCfa: number) {
    const fee = Math.floor(amountCfa * 0.05);
    return { fee, seller: amountCfa - fee };
  }

  private async ensureAccounts(sellerId: string): Promise<Ensure> {
    const p: any = this.prisma as any;
    let escrow = await p.account.findFirst({ where: { type: 'PLATFORM_ESCROW' } });
    if (!escrow) escrow = await p.account.create({ data: { type: 'PLATFORM_ESCROW' } });
    let fees = await p.account.findFirst({ where: { type: 'PLATFORM_FEES' } });
    if (!fees) fees = await p.account.create({ data: { type: 'PLATFORM_FEES' } });
    let psp = await p.account.findFirst({ where: { type: 'EXTERNAL_PSP' } });
    if (!psp) psp = await p.account.create({ data: { type: 'EXTERNAL_PSP' } });
    let sellerAccount = await p.account.findFirst({ where: { userId: sellerId } });
    if (!sellerAccount) sellerAccount = await p.account.create({ data: { type: 'USER', userId: sellerId } });
    return { escrowId: escrow.id, feesId: fees.id, pspId: psp.id, sellerAccountId: sellerAccount.id };
  }

  async createIntent(buyerId: string, listingId: string) {
    const p: any = this.prisma as any;
    const listing = await p.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw new NotFoundException('listing_not_found');
    const { fee, seller } = this.split(listing.priceCfa);
    const intent = await p.paymentIntent.create({
      data: {
        buyerId,
        sellerId: listing.sellerId,
        listingId,
        amountCfa: listing.priceCfa,
        feeCfa: fee,
      },
    });
    return { id: intent.id, amountCfa: intent.amountCfa, feeCfa: intent.feeCfa, sellerAmountCfa: seller, status: intent.status };
  }

  async confirmIntent(intentId: string) {
    const p: any = this.prisma as any;
    const intent = await p.paymentIntent.findUnique({ where: { id: intentId } });
    if (!intent) throw new NotFoundException();
    if (intent.status !== 'REQUIRES_CONFIRMATION') throw new ForbiddenException('invalid_state');

    // AUDIT: Check User Block Status & KYC
    const seller = await p.user.findUnique({ where: { id: intent.sellerId } });
    if (!seller || seller.isBlocked) throw new ForbiddenException('Seller blocked or invalid');
    if (seller.kycStatus !== 'APPROVED') throw new ForbiddenException('Seller KYC not approved');

    const buyer = await p.user.findUnique({ where: { id: intent.buyerId } });
    if (!buyer || buyer.isBlocked) throw new ForbiddenException('Buyer blocked');

    const accounts = await this.ensureAccounts(intent.sellerId);
    await p.$transaction([
      p.paymentIntent.update({ where: { id: intent.id }, data: { status: 'CONFIRMED' } }),
      p.ledgerEntry.createMany({
        data: [
          { accountId: accounts.pspId, intentId: intent.id, deltaCfa: -intent.amountCfa, desc: 'confirm: debit external' },
          { accountId: accounts.escrowId, intentId: intent.id, deltaCfa: +intent.amountCfa, desc: 'confirm: credit escrow' },
        ],
      }),
    ]);
    return { id: intent.id, status: 'CONFIRMED' };
  }

  async captureIntent(intentId: string) {
    const p: any = this.prisma as any;
    const intent = await p.paymentIntent.findUnique({ where: { id: intentId } });
    if (!intent) throw new NotFoundException();
    if (intent.status !== 'CONFIRMED') throw new ForbiddenException('invalid_state');

    // AUDIT: Check User Block Status & KYC
    const seller = await p.user.findUnique({ where: { id: intent.sellerId } });
    if (!seller || seller.isBlocked) throw new ForbiddenException('Seller blocked or invalid');
    if (seller.kycStatus !== 'APPROVED') throw new ForbiddenException('Seller KYC not approved');

    const accounts = await this.ensureAccounts(intent.sellerId);
    const sellerAmount = intent.amountCfa - intent.feeCfa;
    await p.$transaction([
      p.paymentIntent.update({ where: { id: intent.id }, data: { status: 'CAPTURED' } }),
      p.ledgerEntry.createMany({
        data: [
          { accountId: accounts.escrowId, intentId: intent.id, deltaCfa: -sellerAmount, desc: 'capture: debit escrow to seller' },
          { accountId: accounts.sellerAccountId, intentId: intent.id, deltaCfa: +sellerAmount, desc: 'capture: credit seller' },
          { accountId: accounts.escrowId, intentId: intent.id, deltaCfa: -intent.feeCfa, desc: 'capture: debit escrow to fees' },
          { accountId: accounts.feesId, intentId: intent.id, deltaCfa: +intent.feeCfa, desc: 'capture: credit platform fees' },
        ],
      }),
    ]);
    return { id: intent.id, status: 'CAPTURED' };
  }

  async refundIntent(intentId: string) {
    const p: any = this.prisma as any;
    const intent = await p.paymentIntent.findUnique({ where: { id: intentId } });
    if (!intent) throw new NotFoundException();
    if (intent.status !== 'CONFIRMED') throw new ForbiddenException('refund_not_allowed');
    const accounts = await this.ensureAccounts(intent.sellerId);
    await p.$transaction([
      p.paymentIntent.update({ where: { id: intent.id }, data: { status: 'REFUNDED' } }),
      p.ledgerEntry.createMany({
        data: [
          { accountId: accounts.escrowId, intentId: intent.id, deltaCfa: -intent.amountCfa, desc: 'refund: debit escrow' },
          { accountId: accounts.pspId, intentId: intent.id, deltaCfa: +intent.amountCfa, desc: 'refund: credit user' },
        ],
      }),
    ]);
    return { id: intent.id, status: 'REFUNDED' };
  }

  async cancelIntent(intentId: string, userId: string, isAdmin = false) {
    const p: any = this.prisma as any;
    const intent = await p.paymentIntent.findUnique({ where: { id: intentId } });
    if (!intent) throw new NotFoundException();
    
    if (!isAdmin && intent.buyerId !== userId && intent.sellerId !== userId) {
       throw new ForbiddenException('Non autorisé');
    }
  
    if (intent.status !== 'REQUIRES_CONFIRMATION') {
      throw new ForbiddenException('Impossible d\'annuler une commande déjà payée ou traitée');
    }
  
    return p.paymentIntent.update({
      where: { id: intentId },
      data: { status: 'CANCELED' }
    });
  }

  listIntents() {
    const p: any = this.prisma as any;
    return p.paymentIntent.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getIntent(id: string) {
    const p: any = this.prisma as any;
    const intent = await p.paymentIntent.findUnique({
      where: { id },
      include: { listing: true, buyer: true, seller: true }
    });
    if (!intent) throw new NotFoundException('Transaction non trouvée');
    return intent;
  }

  async getAllAccountBalances() {
    const p: any = this.prisma as any;
    const accounts = await p.account.findMany({ orderBy: { type: 'asc' } });
    const results: Array<{ id: string; type: string; balanceCfa: number }> = [];
    for (const acc of accounts) {
      const agg = await p.ledgerEntry.aggregate({
        where: { accountId: acc.id },
        _sum: { deltaCfa: true },
      });
      results.push({ id: acc.id, type: acc.type, balanceCfa: agg._sum.deltaCfa ?? 0 });
    }
    return results;
  }

  listLedger() {
    const p: any = this.prisma as any;
    return p.ledgerEntry.findMany({ 
      orderBy: { createdAt: 'desc' }, 
      take: 200,
      include: { account: { select: { type: true, userId: true } } }
    });
  }

  getUserOrders(userId: string) {
    const p: any = this.prisma as any;
    return p.paymentIntent.findMany({
      where: { buyerId: userId },
      include: { listing: true, seller: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  getUserSales(userId: string) {
    const p: any = this.prisma as any;
    return p.paymentIntent.findMany({
      where: { sellerId: userId },
      include: { listing: true, buyer: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
