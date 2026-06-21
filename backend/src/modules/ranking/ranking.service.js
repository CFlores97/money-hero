import { supabase } from '../../config/supabase.js';
import { AppError } from '../../utils/AppError.js';

export async function getGlobalRanking(userId, limit) {
    // consultar gamification_profiles con users

    const { data: profiles, error } = await supabase
        .from('gamification_profiles')
        .select(`
            user_id, 
            user:users!inner(
                name, 
                avatar
            ),
            total_xp, 
            level, 
            league
        `)
        .order('total_xp', { ascending: false })
        .order('name', {foreignTable: 'user'});

    if (error) throw new AppError(400, error.message);

    const positionProfiles = profiles.map((profile, index) => ({
        position: index + 1,
        ...profile,
    })
    );

    // calcular posicion del usuario
    const userPosition = positionProfiles.find(
        profile => profile.user_id === userId
    );

    // el ultimo valor no es inclusivo
    const topTwenty = positionProfiles.slice(0, parseInt(limit, 10) || 20);

    const globalRanking = {
        scope: 'global',
        data: topTwenty,
        myPosition: userPosition
    }

    return globalRanking;

}

export async function getFriendsRanking(userId) {
    const { data: friendships, error } = await supabase
        .from('friendships')
        .select('requester_id, receiver_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

    if (error) throw new AppError(400, error.message);

    const userAndFriendIds = friendships.map((row) =>
        row.requester_id === userId ? row.receiver_id : row.requester_id
    );

    userAndFriendIds.push(userId); 

    const { data: friendsProfiles, error: friendsError } = await supabase
        .from('gamification_profiles')
        .select(`
                user_id, 
                user:users!inner(
                    name, 
                    avatar
                ),
                total_xp, 
                level, 
                league
            `)
        .in('user_id', userAndFriendIds)
        .order('total_xp', { ascending: false })
        .order('name', {foreignTable: 'user'});

    if (friendsError) throw new AppError(400, friendsError.message);

    const friendPosProfiles = friendsProfiles.map((profile, index) => ({
        position: index + 1,
        ...profile,
    })
    );

    const userPosition = friendPosProfiles.find(
        profile => profile.user_id === userId
    );

    const friendsRanking = {
        scope: 'friends',
        data: friendPosProfiles,
        myPosition: userPosition
    }

    return friendsRanking;

}