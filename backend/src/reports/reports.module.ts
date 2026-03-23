import { Global, Module } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Global()
@Module({
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
