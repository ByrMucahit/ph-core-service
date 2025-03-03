import { Injectable } from '@nestjs/common';
import { MoneyTransactionDataAccess } from './money-transaction.data-access';
import { CreateMoneyTransactionInterface } from './interfaces/create-money-transaction.interface';
import { MoneyTransactionEntity } from './money-transaction.entity';

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

  async createMoneyTransactions(moneyTransactions: MoneyTransactionEntity[]) {
    await this.moneyTransactionDataAccess.createMoneyTransactions(moneyTransactions);
  }

  private distributeMoneyIntoPoolAndOwner(amount: number) {
    const amountForPool = amount * this.RATE_FOR_POOL;
    return { amountForPool, amountForOwner: amount - amountForPool };
  }

  async findSumMoneyTransactionByDateAndUserId(startDate: Date, endDate: Date) {
    return this.moneyTransactionDataAccess.sumMoneyTransactionByDateAndUserId(startDate, endDate);
  }

  async findSumMoneyTransactionByDateAndUserIds(startDate: Date, endDate: Date) {
    return this.moneyTransactionDataAccess.sumMoneyTransactionByDateAndUserIds(startDate, endDate);
  }

  async findSumMoneyTransactionByDateAndMap(startDate: Date, endDate: Date) {
    const response = await this.moneyTransactionDataAccess.sumMoneyTransactionByDateAndUserIds(
      startDate,
      endDate,
    );
    const resultMap: Map<string, number> = new Map<string, number>();
    for (const r of response) {
      resultMap.set(r.user_id, r.money);
    }
    return resultMap;
  }

  async collectMoneyForAwardingByDate(startDate: Date, endDate: Date) {
    return this.moneyTransactionDataAccess.sumMoneyInPoolForAwardingByDate(startDate, endDate);
  }

  calculateRationOnRank(totalPrize: number) {
    const rewards: { [rank: number]: number } = {};
    rewards[1] = 0.2 * totalPrize;
    rewards[2] = 0.15 * totalPrize;
    rewards[3] = 0.1 * totalPrize;

    const remainingPrize = 0.55 * totalPrize;
    let totalInverse = 0;
    for (let k = 4; k <= 100; k++) {
      totalInverse += 1 / k;
    }
    for (let rank = 4; rank <= 100; rank++) {
      rewards[rank] = (remainingPrize / totalInverse) * (1 / rank);
    }
    return rewards;
  }

  async distributeAwardOnRank(userProfiles: any[], amountMoneyForAward: number) {
    const prizeList = this.calculateRationOnRank(amountMoneyForAward);
    const map: any = new Map<string, number>();
    const userProfileList: any = [];
    for (let index = 0; index < userProfiles.length; index++) {
      const haveMoney: number = userProfiles[index].money;
      const calculatedMoney = haveMoney + prizeList[index + 1];
      map.set(userProfiles[index].userId, calculatedMoney);
      userProfileList.push({ money: calculatedMoney });
    }

    return map;
  }
}
