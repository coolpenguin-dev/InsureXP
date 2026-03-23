import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsOptional()
  @IsString()
  insuranceId?: string;
}
