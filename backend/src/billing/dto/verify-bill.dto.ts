import { IsOptional, IsUUID } from 'class-validator';

export class VerifyBillDto {
  @IsUUID()
  billId: string;

  @IsOptional()
  @IsUUID()
  approvedBy?: string;
}
