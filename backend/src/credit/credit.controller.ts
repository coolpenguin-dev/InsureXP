import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreditService } from './credit.service';

@Controller('credit')
@UseGuards(JwtAuthGuard)
export class CreditController {
  constructor(private readonly credit: CreditService) {}

  @Post('score')
  score(@Body() body: Record<string, unknown>) {
    return this.credit.score(body);
  }

  @Post('approve')
  approve(@Body() body: Record<string, unknown>) {
    return this.credit.approve(body);
  }
}
