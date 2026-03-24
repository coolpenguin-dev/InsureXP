import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Bill } from '../entities/bill.entity';
import { BillItem } from '../entities/bill-item.entity';
import { Payment } from '../entities/payment.entity';
import { Service } from '../entities/service.entity';
import { CreateBillDto } from './dto/create-bill.dto';
import { BillPaymentMode, PayBillDto } from './dto/pay-bill.dto';
import { RequestCashier } from '../auth/strategies/jwt.strategy';
import { formatMoney, moneyEquals, roundMoney, tryParseMoney } from './billing-money.util';

const PAYABLE_STATUSES = ['draft', 'pending_verification'] as const;

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Bill)
    private readonly bills: Repository<Bill>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 1–3. Subtotal, optional discount (percent or fixed), optional cashback, final total.
   * Validation: exclusive discount inputs, caps, non-negative final.
   */
  async create(dto: CreateBillDto, cashier: RequestCashier) {
    const hospitalId = cashier.hospitalId;

    const hasPct = dto.discountPercent != null;
    const hasAmt = dto.discountAmount != null && dto.discountAmount !== '';
    if (hasPct && hasAmt) {
      throw new BadRequestException('Provide either discountPercent or discountAmount, not both');
    }

    return this.dataSource.transaction(async (manager) => {
      const svcRepo = manager.getRepository(Service);
      const billRepo = manager.getRepository(Bill);
      const itemRepo = manager.getRepository(BillItem);

      let subtotal = 0;
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
        subtotal = roundMoney(subtotal + lineTotal);
        lines.push({ service, qty: line.qty, unit, line: lineTotal });
      }

      let discount = 0;
      if (hasPct) {
        discount = roundMoney((subtotal * dto.discountPercent!) / 100);
      } else if (hasAmt) {
        const parsed = tryParseMoney(dto.discountAmount!);
        if (parsed === null) {
          throw new BadRequestException('Invalid discountAmount');
        }
        discount = parsed;
      }

      if (discount > subtotal) {
        throw new BadRequestException('Discount cannot exceed subtotal');
      }

      const afterDiscount = roundMoney(subtotal - discount);

      let cashback = 0;
      if (dto.cashbackAmount != null && dto.cashbackAmount !== '') {
        const parsed = tryParseMoney(dto.cashbackAmount);
        if (parsed === null) {
          throw new BadRequestException('Invalid cashbackAmount');
        }
        cashback = parsed;
      }

      if (cashback > afterDiscount) {
        throw new BadRequestException('Cashback cannot exceed subtotal minus discount');
      }

      const final = roundMoney(afterDiscount - cashback);
      if (final < 0) {
        throw new BadRequestException('Final amount cannot be negative');
      }

      const bill = billRepo.create({
        patientId: dto.patientId,
        hospitalId,
        cashierId: cashier.cashierId,
        totalAmount: formatMoney(subtotal),
        discountAmount: formatMoney(discount),
        cashbackAmount: formatMoney(cashback),
        finalAmount: formatMoney(final),
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

      // Must use the same transactional manager: the global repository cannot see
      // uncommitted rows, so this.findOne() here always failed with "Bill not found".
      const created = await billRepo.findOne({
        where: { id: bill.id, hospitalId: cashier.hospitalId },
        relations: {
          patient: true,
          items: { service: true },
          hospital: true,
          cashier: true,
        },
      });
      if (!created) {
        throw new NotFoundException('Bill not found');
      }
      return created;
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
        payments: true,
      },
    });
    if (!bill) {
      throw new NotFoundException('Bill not found');
    }
    return bill;
  }

  /** Placeholder: enqueue verification (WhatsApp / email) when integrated. */
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

  /**
   * 4–5. Full cash, full insurance, or split; amounts must match finalAmount.
   */
  async pay(dto: PayBillDto, cashier: RequestCashier) {
    const bill = await this.findOne(dto.billId, cashier);

    if (!PAYABLE_STATUSES.includes(bill.status as (typeof PAYABLE_STATUSES)[number])) {
      throw new BadRequestException('Bill cannot be paid in its current status');
    }
    if (bill.payments?.length) {
      throw new BadRequestException('Bill already has payments recorded');
    }

    const final = bill.finalAmount;

    if (dto.mode === BillPaymentMode.SPLIT) {
      if (dto.cashAmount == null || dto.insuranceAmount == null) {
        throw new BadRequestException('Split payment requires cashAmount and insuranceAmount');
      }
      const cash = tryParseMoney(dto.cashAmount);
      const ins = tryParseMoney(dto.insuranceAmount);
      if (cash === null || ins === null) {
        throw new BadRequestException('Invalid split payment amounts');
      }
      if (cash <= 0 || ins <= 0) {
        throw new BadRequestException('Split payment requires positive cash and insurance portions');
      }
      const sum = formatMoney(roundMoney(cash + ins));
      if (!moneyEquals(sum, final)) {
        throw new BadRequestException(
          `Cash plus insurance (${sum}) must equal final amount (${final})`,
        );
      }

      await this.dataSource.transaction(async (manager) => {
        const bRepo = manager.getRepository(Bill);
        const pRepo = manager.getRepository(Payment);
        await pRepo.save(
          pRepo.create({
            billId: bill.id,
            method: 'cash',
            amount: formatMoney(cash),
            status: 'completed',
          }),
        );
        await pRepo.save(
          pRepo.create({
            billId: bill.id,
            method: 'insurance',
            amount: formatMoney(ins),
            status: 'completed',
          }),
        );
        await bRepo.update(bill.id, { status: 'paid', paymentMode: BillPaymentMode.SPLIT });
      });
    } else if (dto.mode === BillPaymentMode.CASH) {
      await this.recordSinglePayment(bill.id, 'cash', final);
    } else {
      await this.recordSinglePayment(bill.id, 'insurance', final);
    }

    return this.findOne(bill.id, cashier);
  }

  private async recordSinglePayment(billId: string, method: 'cash' | 'insurance', amount: string) {
    await this.dataSource.transaction(async (manager) => {
      const bRepo = manager.getRepository(Bill);
      const pRepo = manager.getRepository(Payment);
      await pRepo.save(
        pRepo.create({
          billId,
          method,
          amount,
          status: 'completed',
        }),
      );
      await bRepo.update(billId, {
        status: 'paid',
        paymentMode: method,
      });
    });
  }
}
