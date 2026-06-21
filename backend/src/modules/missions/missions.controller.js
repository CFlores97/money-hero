import * as missionService from './missions.service.js';

export async function getMissions(req, res, next) {
  try {
    const missions = await missionService.getMissions(
      req.user.id,
      req.query
    );

    res.status(200).json(missions);
  } catch (error) {
    next(error);
  }
}

export async function completeMission(req, res, next) {
  try {
    const result = await missionService.completeMission(
      req.user.id,
      req.params.id
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
