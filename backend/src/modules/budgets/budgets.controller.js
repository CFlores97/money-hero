import * as budgetService from './budgets.service.js';

export async function createBudget(req, res, next) {
  try {
    const budget = await budgetService.createBudget(
      req.user.id,
      req.validated.body
    );

    res.status(201).json(budget);
  } catch (error) {
    next(error);
  }
}