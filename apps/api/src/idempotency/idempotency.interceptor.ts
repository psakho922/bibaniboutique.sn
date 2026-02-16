/**
 * AUDIT DOC:
 * - Interceptor d'idempotence générique.
 * - Si Idempotency-Key est présent:
 *   - cherche une réponse complétée → renvoie la même
 *   - sinon verrouille (anti courses), laisse exécuter, stocke la réponse et renvoie
 */
import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Inject } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { createHash } from 'crypto';
import { IdempotencyStore } from './idempotency.store';

function hashRequest(method: string, url: string, body: any) {
  const h = createHash('sha256');
  h.update(method + '|' + url + '|' + JSON.stringify(body ?? {}));
  return h.digest('hex');
}

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(@Inject('IDEMPOTENCY_STORE') private store: IdempotencyStore) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const key = req.headers['idempotency-key'] as string | undefined;
    if (!key) return next.handle();
    const requestHash = hashRequest(req.method, req.url, req.body);
    return from(this.store.findCompleted(key, requestHash)).pipe(
      switchMap((stored) => {
        if (stored) {
          res.status(stored.statusCode);
          return from(Promise.resolve(stored.body));
        }
        return from(this.store.tryLock(key, requestHash)).pipe(
          switchMap((ok) => {
            if (!ok) {
              res.status(409);
              return from(Promise.resolve({ error: 'idempotency_locked' }));
            }
            return next.handle().pipe(
              map(async (body) => {
                const statusCode = res.statusCode || 200;
                await this.store.complete(key, requestHash, statusCode, body);
                return body;
              }),
              switchMap((p) => from(p)),
            );
          }),
        );
      }),
    );
  }
}
