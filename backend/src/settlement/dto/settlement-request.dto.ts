import { IsUUID } from 'class-validator';

export class SettlementRequestDto {
  @IsUUID()
  billId: string;
}
