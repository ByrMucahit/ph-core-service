import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProfileEntity } from './user-profile.entity';
import { Repository } from 'typeorm';
import { CreateUserProfileDto } from './dtos/create-user-profile.dto';
import { UpdateUserProfileDto } from './exceptions/update-user-profile.dto';

@Injectable()
export class UserProfileDataAccess {
  constructor(
    @InjectRepository(UserProfileEntity)
    private userProfileRepository: Repository<UserProfileEntity>,
  ) {}

  async findUserProfileByUserId(user_id: string, projection: { [key: string]: 1 }) {
    return this.userProfileRepository.findOne({ select: projection, where: { user_id } });
  }

  async findUserProfile() {
    return this.userProfileRepository
      .createQueryBuilder()
      .select()
      .orderBy('money', 'DESC')
      .getMany();
  }

  async createUserProfile(creatUserProfileDto: CreateUserProfileDto) {
    const userProfileEntity = this.userProfileRepository.create(creatUserProfileDto);
    userProfileEntity.money = 0;
    userProfileEntity.created_at = new Date();
    userProfileEntity.updated_at = new Date();
    return this.userProfileRepository.save(userProfileEntity);
  }

  async updateUserProfile(
    userProfileEntity: UserProfileEntity,
    updateUserProfile: UpdateUserProfileDto,
  ) {
    const { money } = updateUserProfile;
    await this.userProfileRepository
      .createQueryBuilder()
      .update(userProfileEntity)
      .set({ money, updated_at: new Date() })
      .where('user_id = :user_id', { user_id: userProfileEntity.user_id })
      .execute();
  }

  async updateUserProfiles(userProfiles: UserProfileEntity[]) {
    await this.userProfileRepository.save(userProfiles);
  }
}
