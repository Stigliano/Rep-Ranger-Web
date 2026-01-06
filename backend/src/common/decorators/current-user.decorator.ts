import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator per ottenere l'utente corrente dalla request
 * Utilizzato nei controller per accedere ai dati dell'utente autenticato
 */
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
