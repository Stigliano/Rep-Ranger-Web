import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Local Auth Guard
 * Utilizzato per proteggere endpoint di login
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
