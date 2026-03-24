import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bill } from '../entities/bill.entity';
import { BillItem } from '../entities/bill-item.entity';
import { Hospital } from '../entities/hospital.entity';
import { Payment } from '../entities/payment.entity';
import { Service } from '../entities/service.entity';
import { Settlement } from '../entities/settlement.entity';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bill,
      BillItem,
      Service,
      Hospital,
      Payment,
      Settlement,
    ]),
  ],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
