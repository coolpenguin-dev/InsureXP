import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Bill } from './bill.entity';
import { Service } from './service.entity';

@Entity('bill_items')
export class BillItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'bill_id', type: 'uuid' })
  billId: string;

  @ManyToOne(() => Bill, (b) => b.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bill_id' })
  bill: Bill;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @ManyToOne(() => Service, (s) => s.billItems)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ type: 'int' })
  qty: number;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  price: string;

  @Column({ name: 'line_total', type: 'decimal', precision: 14, scale: 2 })
  lineTotal: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
