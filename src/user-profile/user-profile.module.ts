import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfileEntity } from './user-profile.entity';
import { UserProfileService } from './user-profile.service';
import { UserProfileController } from './user-profile.controller';
import { UserProfileDataAccess } from './user-profile.data-access';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfileEntity])],
  providers: [UserProfileService, UserProfileDataAccess],
  controllers: [UserProfileController],
  exports: [UserProfileService],
})
export class UserProfileModule {}
