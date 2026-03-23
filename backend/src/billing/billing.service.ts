import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Bill } from '../entities/bill.entity';
import { BillItem } from '../entities/bill-item.entity';
import { Service } from '../entities/service.entity';
import { CreateBillDto } from './dto/create-bill.dto';
import { RequestCashier } from '../auth/strategies/jwt.strategy';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Bill)
    private readonly bills: Repository<Bill>,
    @InjectRepository(BillItem)
    private readonly items: Repository<BillItem>,
    @InjectRepository(Service)
    private readonly services: Repository<Service>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateBillDto, cashier: RequestCashier) {
    const hospitalId = cashier.hospitalId;

    return this.dataSource.transaction(async (manager) => {
      const svcRepo = manager.getRepository(Service);
      const billRepo = manager.getRepository(Bill);
      const itemRepo = manager.getRepository(BillItem);

      let total = 0;
      const lines: { service: Service; qty: number; unit: number; line: number }[] = [];

      for (const line of dto.items) {
        const service = await svcRepo.findOne({
          where: { id: line.serviceId, hospitalId },
        });
        if (!service) {
          throw new BadRequestException(`Unknown service for hospital: ${line.serviceId}`);
        }
        const unit = Number(service.price);
        const lineTotal = unit * line.qty;
        total += lineTotal;
        lines.push({ service, qty: line.qty, unit, line: lineTotal });
      }

      const bill = billRepo.create({
        patientId: dto.patientId,
        hospitalId,
        cashierId: cashier.cashierId,
        totalAmount: total.toFixed(2),
        status: 'draft',
      });
      await billRepo.save(bill);

      for (const l of lines) {
        const item = itemRepo.create({
          billId: bill.id,
          serviceId: l.service.id,
          qty: l.qty,
          price: l.unit.toFixed(2),
          lineTotal: l.line.toFixed(2),
        });
        await itemRepo.save(item);
      }

      return this.findOne(bill.id, cashier);
    });
  }

  async findOne(id: string, cashier: RequestCashier) {
    const bill = await this.bills.findOne({
      where: { id, hospitalId: cashier.hospitalId },
      relations: {
        patient: true,
        items: { service: true },
        hospital: true,
        cashier: true,
      },
    });
    if (!bill) {
      throw new NotFoundException('Bill not found');
    }
    return bill;
  }

  /** Placeholder: enqueue verification (WhatsApp / email) in a later milestone. */
  async verify(billId: string, cashier: RequestCashier) {
    const bill = await this.findOne(billId, cashier);
    if (bill.status !== 'draft') {
      throw new BadRequestException('Bill is not in draft status');
    }
    bill.status = 'pending_verification';
    await this.bills.save(bill);
    return {
      billId: bill.id,
      status: bill.status,
      message: 'Verification requested (integration pending)',
    };
  }
}
