import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Bill } from './bill.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'bill_id', type: 'uuid' })
  billId: string;

  @ManyToOne(() => Bill, (b) => b.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bill_id' })
  bill: Bill;

  @Column({ type: 'varchar', length: 32 })
  method: string;

  @Column({ type: 'varchar', length: 32, default: 'initiated' })
  status: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
