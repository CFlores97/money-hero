import { AppError } from '../../utils/AppError.js';
import * as achievementService from './achievements.service.js';

function parseUnlockedQuery(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new AppError(
    400,
    'El parametro unlocked debe ser true o false'
  );
}

export async function getAchievements(req, res, next) {
  try {
    const unlocked = parseUnlockedQuery(req.query.unlocked);

    const achievements = await achievementService.getAchievements(
      req.user.id,
      unlocked
    );

    res.status(200).json(achievements);
  } catch (error) {
    next(error);
  }
}