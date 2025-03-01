import { IsNumber } from 'class-validator';

export class UpdateMoneyDto {
  @IsNumber()
  money: number;
}
