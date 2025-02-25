import { ConflictException } from '@nestjs/common';

export class UserProfileAlreadyExistException extends ConflictException {
  constructor(message: string) {
    super(message);
  }
}
