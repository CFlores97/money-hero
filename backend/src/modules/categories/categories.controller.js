import * as categoryService from './categories.service.js';

export async function getCategories(req, res, next) {
  try {
    const categories = await categoryService.getCategories(req.query);

    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
}