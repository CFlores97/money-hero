import * as goalService from './goals.service.js';

export async function createGoal(req, res, next) {
  try {
    const goal = await goalService.createGoal(req.user.id, req.validated.body);
    res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
}

export async function listGoals(req, res, next) {
  try {
    const goals = await goalService.listGoals(req.user.id, req.query.status);
    res.status(200).json(goals);
  } catch (error) {
    next(error);
  }
}

export async function deleteGoal(req, res, next) {
  try {
    await goalService.deleteGoal(req.user.id, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function updateGoalProgress(req, res, next) {
  try {
    const goal = await goalService.updateGoalProgress(
      req.user.id,
      req.validated.params.id,
      req.validated.body.amount
    );
    res.status(200).json(goal);
  } catch (error) {
    next(error);
  }
}
