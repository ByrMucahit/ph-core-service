import { IsString } from 'class-validator';

export class CreateUserProfileDto {
  @IsString()
  user_id: string;
}
