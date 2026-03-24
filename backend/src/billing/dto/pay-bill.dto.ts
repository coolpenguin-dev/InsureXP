import { IsEnum, IsUUID, Matches, ValidateIf } from 'class-validator';

const MONEY_STRING = /^\d+(\.\d{1,2})?$/;

export enum BillPaymentMode {
  CASH = 'cash',
  INSURANCE = 'insurance',
  SPLIT = 'split',
}

export class PayBillDto {
  @IsUUID()
  billId: string;

  @IsEnum(BillPaymentMode)
  mode: BillPaymentMode;

  @ValidateIf((o: PayBillDto) => o.mode === BillPaymentMode.SPLIT)
  @Matches(MONEY_STRING, { message: 'cashAmount must be a non-negative decimal with at most 2 decimal places' })
  cashAmount?: string;

  @ValidateIf((o: PayBillDto) => o.mode === BillPaymentMode.SPLIT)
  @Matches(MONEY_STRING, { message: 'insuranceAmount must be a non-negative decimal with at most 2 decimal places' })
  insuranceAmount?: string;
}
