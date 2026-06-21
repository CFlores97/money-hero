import * as rankingService from './ranking.service.js';

export async function getGlobalRanking(req, res, next) {
    try{
        const globalRanking = await rankingService.getGlobalRanking(req.user.id, req.query.limit);
        res.status(200).json(globalRanking);
    }catch(error){
        next(error);
    }
}

export async function getFriendsRanking(req, res, next) {
    try{
        const friendsRanking = await rankingService.getFriendsRanking(req.user.id);
        res.status(200).json(friendsRanking);        
    }catch(error){
        next(error);
    }
}