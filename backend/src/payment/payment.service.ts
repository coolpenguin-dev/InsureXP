import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  momo(_body: Record<string, unknown>) {
    return { status: 'stub', method: 'momo', message: 'Mobile money integration pending' };
  }

  insurance(_body: Record<string, unknown>) {
    return { status: 'stub', method: 'insurance', message: 'Insurance payment integration pending' };
  }

  credit(_body: Record<string, unknown>) {
    return { status: 'stub', method: 'credit', message: 'Credit payment integration pending' };
  }
}
