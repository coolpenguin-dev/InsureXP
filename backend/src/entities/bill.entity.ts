import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Hospital } from './hospital.entity';
import { Cashier } from './cashier.entity';
import { BillItem } from './bill-item.entity';
import { Payment } from './payment.entity';
import { Settlement } from './settlement.entity';

@Entity('bills')
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id', type: 'uuid' })
  patientId: string;

  @ManyToOne(() => Patient, (p) => p.bills)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'hospital_id', type: 'uuid' })
  hospitalId: string;

  @ManyToOne(() => Hospital, (h) => h.bills)
  @JoinColumn({ name: 'hospital_id' })
  hospital: Hospital;

  @Column({ name: 'cashier_id', type: 'uuid' })
  cashierId: string;

  @ManyToOne(() => Cashier, (c) => c.bills)
  @JoinColumn({ name: 'cashier_id' })
  cashier: Cashier;

  /** Sum of line items before discount or cashback (gross subtotal). */
  @Column({ name: 'total_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalAmount: string;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  discountAmount: string;

  @Column({ name: 'cashback_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  cashbackAmount: string;

  /** Amount due after discount and cashback (before payment is recorded). */
  @Column({ name: 'final_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  finalAmount: string;

  /** Set when the bill is paid: cash | insurance | split */
  @Column({ name: 'payment_mode', type: 'varchar', length: 32, nullable: true })
  paymentMode: string | null;

  @Column({ type: 'varchar', length: 32, default: 'draft' })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => BillItem, (i) => i.bill, { cascade: true })
  items: BillItem[];

  @OneToMany(() => Payment, (p) => p.bill)
  payments: Payment[];

  @OneToMany(() => Settlement, (s) => s.bill)
  settlements: Settlement[];
}
