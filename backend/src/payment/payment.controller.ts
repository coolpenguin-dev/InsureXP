import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentService } from './payment.service';

@Controller('payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly payment: PaymentService) {}

  @Post('momo')
  momo(@Body() body: Record<string, unknown>) {
    return this.payment.momo(body);
  }

  @Post('insurance')
  insurance(@Body() body: Record<string, unknown>) {
    return this.payment.insurance(body);
  }

  @Post('credit')
  credit(@Body() body: Record<string, unknown>) {
    return this.payment.credit(body);
  }
}
