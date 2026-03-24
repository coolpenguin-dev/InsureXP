import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentCashier } from '../auth/decorators/current-cashier.decorator';
import type { RequestCashier } from '../auth/strategies/jwt.strategy';
import { BillingService } from './billing.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { PayBillDto } from './dto/pay-bill.dto';
import { VerifyBillDto } from './dto/verify-bill.dto';
import { ApproveBillDto } from './dto/approve-bill.dto';

@Controller('bills')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Post('create')
  create(@Body() dto: CreateBillDto, @CurrentCashier() cashier: RequestCashier) {
    return this.billing.create(dto, cashier);
  }

  @Post('verify')
  verify(@Body() dto: VerifyBillDto, @CurrentCashier() cashier: RequestCashier) {
    return this.billing.verify(dto.billId, cashier);
  }

  @Post('approve')
  approve(@Body() dto: ApproveBillDto, @CurrentCashier() cashier: RequestCashier) {
    return this.billing.approve(dto.billId, cashier);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentCashier() cashier: RequestCashier) {
    return this.billing.findOne(id, cashier);
  }

  @Post('pay')
  pay(@Body() dto: PayBillDto, @CurrentCashier() cashier: RequestCashier) {
    return this.billing.pay(dto, cashier);
  }
}
