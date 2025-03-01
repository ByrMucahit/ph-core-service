import { IsNumber } from 'class-validator';

export class UpdateUserProfileDto {
  @IsNumber()
  rank?: number;

  @IsNumber()
  money: number;
}
