import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentCashier } from '../auth/decorators/current-cashier.decorator';
import type { RequestCashier } from '../auth/strategies/jwt.strategy';
import { SettlementRequestDto } from './dto/settlement-request.dto';
import { SettlementService } from './settlement.service';

@Controller('settlement')
@UseGuards(JwtAuthGuard)
export class SettlementController {
  constructor(private readonly settlement: SettlementService) {}

  @Post('instant')
  instant(@Body() dto: SettlementRequestDto, @CurrentCashier() cashier: RequestCashier) {
    return this.settlement.instant(dto.billId, cashier);
  }

  @Post('expedited')
  expedited(@Body() dto: SettlementRequestDto, @CurrentCashier() cashier: RequestCashier) {
    return this.settlement.expedited(dto.billId, cashier);
  }
}
