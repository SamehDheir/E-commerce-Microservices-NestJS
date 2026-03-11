import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderId: string;

  @Column('decimal')
  amount: number;

  @Column()
  status: string; // SUCCESS, FAILED

  @Column({ nullable: true })
  transactionId: string;

  @CreateDateColumn()
  createdAt: Date;
}