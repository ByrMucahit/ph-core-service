import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class UsersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  surname: string;

  @Column()
  country: string;

  @Column()
  username: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: false })
  updated_at!: Date;
}
