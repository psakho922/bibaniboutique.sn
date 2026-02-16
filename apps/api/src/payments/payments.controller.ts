/**
 * AUDIT DOC:
 * - Expose les endpoints REST de paiement.
 * - Exige une clé d'idempotence sur la création d'intention.
 */
import { Body, Controller, Get, Headers, Post, UseInterceptors } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { IdempotencyInterceptor } from '../idempotency/idempotency.interceptor';

class CreateIntentBody {
  listingId!: string;
  buyerId!: string; // pour la démo; en prod: dérivé de req.user
}
class IntentActionBody {
  intentId!: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post('intents')
  @UseInterceptors(IdempotencyInterceptor)
  async create(@Body() body: CreateIntentBody, @Headers('idempotency-key') key?: string) {
    if (!key) throw new Error('Idempotency-Key header required');
    const p: any = (this.payments as any)['prisma'];
    const found = await p.paymentIntent.findFirst({ where: { idempotencyKey: key } });
    if (found) {
      return { id: found.id, status: found.status, amountCfa: found.amountCfa, feeCfa: found.feeCfa };
    }
    const res = await this.payments.createIntent(body.buyerId, body.listingId);
    await p.paymentIntent.update({ where: { id: res.id }, data: { idempotencyKey: key } });
    return res;
  }

  @Post('confirm')
  confirm(@Body() body: IntentActionBody) {
    return this.payments.confirmIntent(body.intentId);
  }

  @Post('capture')
  capture(@Body() body: IntentActionBody) {
    return this.payments.captureIntent(body.intentId);
  }

  @Post('refund')
  refund(@Body() body: IntentActionBody) {
    return this.payments.refundIntent(body.intentId);
  }

  @Get('health')
  health() {
    return { ok: true };
  }

  @Get('intents')
  listIntents() {
    return this.payments.listIntents();
  }

  @Get('accounts')
  getAccounts() {
    return this.payments.getAllAccountBalances();
  }

  @Get('ledger')
  getLedger() {
    return this.payments.listLedger();
  }
}
