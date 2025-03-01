export interface CreateMoneyTransactionInterface {
  user_id: string;

  amount: number;

  amount_to_pool?: number;

  created_at?: Date;

  update_at?: Date;
}
