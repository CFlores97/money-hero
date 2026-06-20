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

export async function listTransactions(req, res, next) {
  try {
    const result = await transactionService.listTransactions(req.user.id, {
      type: req.query.type,
      categoryId: req.query.categoryId,
      from: req.query.from,
      to: req.query.to,
      limit: req.query.limit,
      offset: req.query.offset
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteTransaction(req, res, next) {
  try {
    await transactionService.deleteTransaction(req.user.id, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
