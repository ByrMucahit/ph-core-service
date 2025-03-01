import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoneyTransactionEntity } from './money-transaction.entity';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from './dtos/create-transaction.dto';

@Injectable()
export class MoneyTransactionDataAccess {
  constructor(
    @InjectRepository(MoneyTransactionEntity)
    private moneyTransactionRepository: Repository<MoneyTransactionEntity>,
  ) {}

  async createMoneyTransaction(createTransaction: CreateTransactionDto) {
    const moneyTransactionEntity = this.moneyTransactionRepository.create(createTransaction);
    moneyTransactionEntity.created_at = new Date();
    moneyTransactionEntity.updated_at = new Date();
    await this.moneyTransactionRepository.save(moneyTransactionEntity);
  }
}
