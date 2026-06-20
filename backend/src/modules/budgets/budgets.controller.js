import * as budgetService from './budgets.service.js';

export async function createBudget(req, res, next) {
  try {
    const budget = await budgetService.createBudget(req.user.id, req.validated.body);
    res.status(201).json(budget);
  } catch (error) {
    next(error);
  }
}

export async function getCurrentBudget(req, res, next) {
  try {
    const budget = await budgetService.getCurrentBudget(req.user.id);
    res.status(200).json(budget);
  } catch (error) {
    next(error);
  }
}

export async function deleteBudget(req, res, next) {
  try {
    await budgetService.deleteBudget(req.user.id, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
