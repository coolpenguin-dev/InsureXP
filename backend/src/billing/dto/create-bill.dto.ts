import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BillLineDto {
  @IsUUID()
  serviceId: string;

  @IsInt()
  @Min(1)
  qty: number;
}

/** Non-negative decimal string with up to 2 fractional digits (e.g. 0, 12, 12.5, 12.50). */
const MONEY_STRING = /^\d+(\.\d{1,2})?$/;

export class CreateBillDto {
  @IsUUID()
  patientId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BillLineDto)
  items: BillLineDto[];

  /** Percent of subtotal; mutually exclusive with discountAmount (enforced in service). */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @Type(() => Number)
  discountPercent?: number;

  @IsOptional()
  @Matches(MONEY_STRING, { message: 'discountAmount must be a non-negative decimal with at most 2 decimal places' })
  discountAmount?: string;

  @IsOptional()
  @Matches(MONEY_STRING, { message: 'cashbackAmount must be a non-negative decimal with at most 2 decimal places' })
  cashbackAmount?: string;
}
