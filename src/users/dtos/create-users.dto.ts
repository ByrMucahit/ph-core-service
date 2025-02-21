import { IsString } from 'class-validator';

export class CreateUsersDto {
  @IsString()
  name: string;

  @IsString()
  surname: string;

  @IsString()
  country: string;

  @IsString()
  username: string;
}
