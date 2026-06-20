import * as authService from './auth.service.js';

export async function register(req, res, next) {
  try {
    const result = await authService.register(req.validated.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.validated.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const result = await authService.logout(req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
