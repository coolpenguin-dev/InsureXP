import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patients: Repository<Patient>,
  ) {}

  create(dto: CreatePatientDto) {
    const row = this.patients.create({
      name: dto.name,
      insuranceId: dto.insuranceId ?? null,
    });
    return this.patients.save(row);
  }
}
