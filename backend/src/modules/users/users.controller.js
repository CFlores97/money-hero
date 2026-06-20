import * as userService from './users.service.js';

export async function getMe(req, res, next) {
  try {
    const user = await userService.getMe(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

export async function updateMe(req, res, next) {
  try {
    const user = await userService.updateMe(req.user.id, req.validated.body);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}
