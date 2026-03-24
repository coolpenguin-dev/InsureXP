import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bill } from '../entities/bill.entity';
import { Settlement } from '../entities/settlement.entity';
import type { RequestCashier } from '../auth/strategies/jwt.strategy';

@Injectable()
export class SettlementService {
  constructor(
    @InjectRepository(Bill)
    private readonly bills: Repository<Bill>,
    @InjectRepository(Settlement)
    private readonly settlements: Repository<Settlement>,
  ) {}

  private async loadVerifiedBill(billId: string, hospitalId: string) {
    const bill = await this.bills.findOne({ where: { id: billId, hospitalId } });
    if (!bill) {
      throw new NotFoundException('Bill not found');
    }
    if (bill.status !== 'verified') {
      throw new BadRequestException('Bill must be verified before settlement');
    }
    return bill;
  }

  async instant(billId: string, cashier: RequestCashier) {
    await this.loadVerifiedBill(billId, cashier.hospitalId);
    const existing = await this.settlements.findOne({
      where: { billId, type: 'instant' },
    });
    if (existing) {
      throw new BadRequestException('Instant settlement already recorded for this bill');
    }
    const now = new Date();
    const row = this.settlements.create({
      billId,
      type: 'instant',
      status: 'completed',
      processedAt: now,
    });
    await this.settlements.save(row);
    return {
      settlementId: row.id,
      channel: 'instant' as const,
      status: row.status,
      message: 'Funds released to hospital account (demo). Settlement completed immediately.',
    };
  }

  async expedited(billId: string, cashier: RequestCashier) {
    await this.loadVerifiedBill(billId, cashier.hospitalId);
    const existing = await this.settlements.findOne({
      where: { billId, type: 'expedited' },
    });
    if (existing) {
      throw new BadRequestException('Expedited settlement already queued for this bill');
    }
    const row = this.settlements.create({
      billId,
      type: 'expedited',
      status: 'queued',
      processedAt: null,
    });
    await this.settlements.save(row);
    return {
      settlementId: row.id,
      channel: 'expedited' as const,
      status: row.status,
      message:
        'Expedited queue: priority processing within 24h (demo). You will receive a confirmation when funds settle.',
    };
  }
}
