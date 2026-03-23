import { Module } from '@nestjs/common';
import { SettlementController } from './settlement.controller';
import { SettlementService } from './settlement.service';

@Module({
  controllers: [SettlementController],
  providers: [SettlementService],
})
export class SettlementModule {}
