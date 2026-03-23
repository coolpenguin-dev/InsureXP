import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../entities/service.entity';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Service)
    private readonly services: Repository<Service>,
  ) {}

  listForHospital(hospitalId: string) {
    return this.services.find({
      where: { hospitalId },
      order: { category: 'ASC', name: 'ASC' },
    });
  }
}
