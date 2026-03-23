import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Cashier } from './cashier.entity';
import { Service } from './service.entity';
import { Bill } from './bill.entity';

@Entity('hospitals')
export class Hospital {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  location: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => Cashier, (c) => c.hospital)
  cashiers: Cashier[];

  @OneToMany(() => Service, (s) => s.hospital)
  services: Service[];

  @OneToMany(() => Bill, (b) => b.hospital)
  bills: Bill[];
}
