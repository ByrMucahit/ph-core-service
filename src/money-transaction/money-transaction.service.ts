import { Injectable } from '@nestjs/common';
import { MoneyTransactionDataAccess } from './money-transaction.data-access';
import { CreateMoneyTransactionInterface } from './interfaces/create-money-transaction.interface';

@Injectable()
export class MoneyTransactionService {
  RATE_FOR_POOL = 0.2;
  constructor(private moneyTransactionDataAccess: MoneyTransactionDataAccess) {}

  async createMoneyTransaction(createTransactionDto: CreateMoneyTransactionInterface) {
    const distributeMoney = this.distributeMoneyIntoPoolAndOwner(createTransactionDto.amount);
    createTransactionDto.amount = distributeMoney.amountForOwner;
    createTransactionDto.amount_to_pool = distributeMoney.amountForPool;
    createTransactionDto.created_at = new Date();
    createTransactionDto.update_at = new Date();
    await this.moneyTransactionDataAccess.createMoneyTransaction(createTransactionDto);
  }

  private distributeMoneyIntoPoolAndOwner(amount: number) {
    const amountForPool = amount * this.RATE_FOR_POOL;
    return { amountForPool, amountForOwner: amount - amountForPool };
  }
}
