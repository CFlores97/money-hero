import * as gamificationService from './gamification.service.js';

export async function getProgress(req, res, next) {
    try{
        const progress = await gamificationService.progress(req.user.id);

        res.status(200).json(progress);
    } catch (error) {
        next(error);
    }
}