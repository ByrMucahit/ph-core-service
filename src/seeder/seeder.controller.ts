import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Controller('/seed')
export class SeederController {
  constructor(private seederService: SeederService) {}

  @Post('profile-user')
  @HttpCode(HttpStatus.OK)
  async userProfileSeederController(@Body() metaData: { count: number }) {
    await this.seederService.createMultipleUser(metaData.count);
  }
}
