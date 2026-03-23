import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Bill } from './bill.entity';

@Entity('settlements')
export class Settlement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'bill_id', type: 'uuid' })
  billId: string;

  @ManyToOne(() => Bill, (b) => b.settlements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bill_id' })
  bill: Bill;

  @Column({ type: 'varchar', length: 32 })
  type: string;

  @Column({ type: 'varchar', length: 32, default: 'requested' })
  status: string;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
