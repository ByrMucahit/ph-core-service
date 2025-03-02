import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'money-transaction' })
export class MoneyTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column('decimal', { precision: 6, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 6, scale: 2, nullable: true })
  amount_to_pool: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: false })
  updated_at!: Date;

  @Column({ nullable: true })
  is_award: boolean;
}
