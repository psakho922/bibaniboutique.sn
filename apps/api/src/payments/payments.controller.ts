/**
 * AUDIT DOC:
 * - Expose les endpoints REST de paiement.
 * - Exige une clé d'idempotence sur la création d'intention.
 */
import { Body, Controller, Get, Headers, Post, UseInterceptors, UseGuards, Request } from '@nestjs/common';
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
  confirm(@Body() body: IntentActionBody) {
    return this.payments.confirmIntent(body.intentId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('capture')
  capture(@Body() body: IntentActionBody) {
    return this.payments.captureIntent(body.intentId);
  }

  @UseGuards(JwtAuthGuard)
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
