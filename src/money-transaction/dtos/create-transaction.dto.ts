import { IsDate, IsNumber, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  user_id: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  amount_to_pool: number;

  @IsDate()
  created_at: Date;

  @IsDate()
  update_at: Date;
}
