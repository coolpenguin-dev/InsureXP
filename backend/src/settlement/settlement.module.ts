import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bill } from '../entities/bill.entity';
import { Settlement } from '../entities/settlement.entity';
import { SettlementController } from './settlement.controller';
import { SettlementService } from './settlement.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bill, Settlement])],
  controllers: [SettlementController],
  providers: [SettlementService],
})
export class SettlementModule {}
