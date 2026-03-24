import { IsUUID } from 'class-validator';

export class ApproveBillDto {
  @IsUUID()
  billId: string;
}
