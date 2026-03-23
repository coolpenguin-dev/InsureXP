import { ArrayMinSize, IsArray, IsUUID, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class BillLineDto {
  @IsUUID()
  serviceId: string;

  @IsInt()
  @Min(1)
  qty: number;
}

export class CreateBillDto {
  @IsUUID()
  patientId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BillLineDto)
  items: BillLineDto[];
}
