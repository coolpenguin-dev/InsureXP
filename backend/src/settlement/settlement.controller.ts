import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SettlementService } from './settlement.service';

@Controller('settlement')
@UseGuards(JwtAuthGuard)
export class SettlementController {
  constructor(private readonly settlement: SettlementService) {}

  @Post('instant')
  instant(@Body() body: Record<string, unknown>) {
    return this.settlement.instant(body);
  }

  @Post('expedited')
  expedited(@Body() body: Record<string, unknown>) {
    return this.settlement.expedited(body);
  }
}
