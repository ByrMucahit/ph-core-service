import { NotFoundException } from '@nestjs/common';

export class UserProfileNotFoundException extends NotFoundException {
  constructor(message: string) {
    super(message);
  }
}
