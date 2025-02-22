import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoneyTransactionEntity } from './money-transaction.entity';
import { MoneyTransactionDataAccess } from './money-transaction.data-access';
import { MoneyTransactionService } from './money-transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([MoneyTransactionEntity])],
  providers: [MoneyTransactionDataAccess, MoneyTransactionService],
  controllers: [],
  exports: [MoneyTransactionService],
})
export class MoneyTransactionModule {}
