import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'user-profile' })
export class UserProfileEntity {
  @PrimaryColumn()
  user_id: string;

  @Column()
  rank: number;

  @Column('decimal', { precision: 12, scale: 4 })
  money: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: false })
  updated_at!: Date;
}
