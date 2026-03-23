import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { CatalogModule } from './catalog/catalog.module';
import { CreditModule } from './credit/credit.module';
import { PaymentModule } from './payment/payment.module';
import { PatientsModule } from './patients/patients.module';
import { ReportsModule } from './reports/reports.module';
import { SettlementModule } from './settlement/settlement.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
        logging: config.get<string>('NODE_ENV') === 'development',
      }),
    }),
    ReportsModule,
    AuthModule,
    PatientsModule,
    CatalogModule,
    BillingModule,
    SettlementModule,
    PaymentModule,
    CreditModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
