import { IsNumber } from 'class-validator';

export class CreateMoneyTransactionDto {
  @IsNumber()
  amount: number;
}
