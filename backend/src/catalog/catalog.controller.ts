import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentCashier } from '../auth/decorators/current-cashier.decorator';
import type { RequestCashier } from '../auth/strategies/jwt.strategy';
import { CatalogService } from './catalog.service';

@Controller('services')
@UseGuards(JwtAuthGuard)
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  list(@CurrentCashier() cashier: RequestCashier) {
    return this.catalog.listForHospital(cashier.hospitalId);
  }
}
