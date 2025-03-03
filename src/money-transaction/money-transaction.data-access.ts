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

  async createMoneyTransactions(moneyTransactionEntities: MoneyTransactionEntity[]) {
    await this.moneyTransactionRepository.save(moneyTransactionEntities);
  }

  async sumMoneyTransactionByDateAndUserId(startDate: Date, endDate: Date) {
    return this.moneyTransactionRepository.query(
      `
      SELECT user_id, sum(amount) as money
      FROM "money-transaction"
      WHERE  1 = 1 AND updated_at >= $1
      AND updated_at <= $2
      GROUP BY user_id
      ORDER BY updated_at DESC
    `,
      [startDate, endDate],
    );
  }

  async sumMoneyTransactionByDateAndUserIds(startDate: Date, endDate: Date) {
    const response = await this.moneyTransactionRepository.query(
      `
      SELECT user_id, sum(amount) as money
      FROM "money-transaction"
      WHERE  1 = 1 AND updated_at >= $1
      AND updated_at  <= $2
      GROUP BY user_id
    `,
      [startDate, endDate],
    );
    return response;
  }

  async sumMoneyInPoolForAwardingByDate(startDate: Date, endDate: Date) {
    const response = await this.moneyTransactionRepository.query(
      `
      SELECT sum(amount_to_pool) as sum_award_money
      FROM "money-transaction"
      WHERE  1 = 1 AND updated_at >= $1
      AND updated_at  <= $2
      and is_award IS NULL
    `,
      [startDate, endDate],
    );
    return response[0];
  }
}
