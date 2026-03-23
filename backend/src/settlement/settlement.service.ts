import { Injectable } from '@nestjs/common';

@Injectable()
export class SettlementService {
  instant(_body: Record<string, unknown>) {
    return { status: 'stub', channel: 'instant', message: 'Stanbic / bank integration pending' };
  }

  expedited(_body: Record<string, unknown>) {
    return { status: 'stub', channel: 'expedited', message: 'Expedited settlement queue pending' };
  }
}
