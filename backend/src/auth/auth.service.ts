import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Cashier } from '../entities/cashier.entity';
import { LoginDto } from './dto/login.dto';

export type JwtPayload = {
  sub: string;
  email: string;
  hospitalId: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Cashier)
    private readonly cashiers: Repository<Cashier>,
    private readonly jwt: JwtService,
  ) {}

  async validateCashier(dto: LoginDto): Promise<Cashier> {
    const cashier = await this.cashiers
      .createQueryBuilder('c')
      .addSelect('c.password_hash')
      .where('c.email = :email', { email: dto.email })
      .getOne();

    if (!cashier?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(dto.password, cashier.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return cashier;
  }

  async login(dto: LoginDto) {
    const cashier = await this.validateCashier(dto);
    const payload: JwtPayload = {
      sub: cashier.id,
      email: cashier.email,
      hospitalId: cashier.hospitalId,
    };
    return {
      access_token: await this.jwt.signAsync(payload),
      cashier: {
        id: cashier.id,
        name: cashier.name,
        email: cashier.email,
        hospitalId: cashier.hospitalId,
      },
    };
  }
}
