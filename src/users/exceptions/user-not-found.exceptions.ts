import { NotFoundException } from '@nestjs/common';

export class UserNotFoundExceptions extends NotFoundException {
  constructor(error: string = 'User not found') {
    super('UserNotFound', error);
  }
}
