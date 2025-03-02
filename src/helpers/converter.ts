export function dataTypeConverterFromDbToResponse(moneyTransactions: any[]) {
  const response: any = [];
  for (const mt of moneyTransactions) {
    response.push({
      userId: mt.user_id,
      money: Number(mt.money),
    });
  }
  return response;
}
