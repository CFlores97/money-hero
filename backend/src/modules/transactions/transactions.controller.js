import * as transactionService from './transactions.service.js';

export async function createTransaction(req, res, next) {
  try {
    const transaction = await transactionService.createTransaction(
      req.user.id,
      req.validated.body
    );

    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
}