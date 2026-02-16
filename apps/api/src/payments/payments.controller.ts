/**
 * AUDIT DOC:
 * - Expose les endpoints REST de paiement.
 * - Exige une clé d'idempotence sur la création d'intention.
 */
import { Body, Controller, Get, Headers, Post, UseInterceptors, UseGuards, Request, ForbiddenException, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { IdempotencyInterceptor } from '../idempotency/idempotency.interceptor';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreateIntentBody {
  listingId!: string;
}
class IntentActionBody {
  intentId!: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('intents')
  @UseInterceptors(IdempotencyInterceptor)
  async create(@Request() req: any, @Body() body: CreateIntentBody, @Headers('idempotency-key') key?: string) {
    if (!key) throw new Error('Idempotency-Key header required');
    const p: any = (this.payments as any)['prisma'];
    const found = await p.paymentIntent.findFirst({ where: { idempotencyKey: key } });
    if (found) {
      return { id: found.id, status: found.status, amountCfa: found.amountCfa, feeCfa: found.feeCfa };
    }
    const res = await this.payments.createIntent(req.user.userId, body.listingId);
    await p.paymentIntent.update({ where: { id: res.id }, data: { idempotencyKey: key } });
    return res;
  }

  @UseGuards(JwtAuthGuard)
  @Post('confirm')
  confirm(@Request() req: any, @Body() body: IntentActionBody) {
    // In a real app, only webhooks or admin can confirm.
    // For this demo, we allow authenticated users to simulate payment success (or admin).
    return this.payments.confirmIntent(body.intentId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('capture')
  capture(@Request() req: any, @Body() body: IntentActionBody) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException('Admin access required');
    return this.payments.captureIntent(body.intentId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refund')
  refund(@Request() req: any, @Body() body: IntentActionBody) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException('Admin access required');
    return this.payments.refundIntent(body.intentId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cancel')
  cancel(@Request() req: any, @Body() body: IntentActionBody) {
    return this.payments.cancelIntent(body.intentId, req.user.userId, req.user.role === 'ADMIN');
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-orders')
  async getMyOrders(@Request() req: any) {
    return this.payments.getUserOrders(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-sales')
  async getMySales(@Request() req: any) {
    if (req.user.role !== 'SELLER' && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Seller access required');
    }
    return this.payments.getUserSales(req.user.userId);
  }

  @Get('health')
  health() {
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('intents')
  listIntents(@Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException('Admin access required');
    return this.payments.listIntents();
  }

  @UseGuards(JwtAuthGuard)
  @Get('intents/:id')
  async getIntent(@Request() req: any, @Param('id') id: string) {
    const intent = await this.payments.getIntent(id);
    if (req.user.role !== 'ADMIN' && intent.buyerId !== req.user.userId && intent.sellerId !== req.user.userId) {
      throw new ForbiddenException('Non autorisé');
    }
    return intent;
  }

  @UseGuards(JwtAuthGuard)
  @Get('accounts')
  getAccounts(@Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException('Admin access required');
    return this.payments.getAllAccountBalances();
  }

  @UseGuards(JwtAuthGuard)
  @Get('ledger')
  getLedger(@Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException('Admin access required');
    return this.payments.listLedger();
  }
}
