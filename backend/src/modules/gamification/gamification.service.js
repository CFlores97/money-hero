import { supabase } from '../../config/supabase.js';
import { AppError } from '../../utils/AppError.js';
import {
    calculateLevel,
    calculateLeague
} from '../../utils/gamificationRules.js';

export async function addXp(userId, xpAmount) {
    const { data: current, error: findError } = await supabase
        .from('gamification_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

    if (findError) {
        throw new AppError(400, findError.message);
    }

    const newTotalXp = (current?.total_xp || 0) + xpAmount;
    const newLevel = calculateLevel(newTotalXp);
    const newLeague = calculateLeague(newLevel);

    const { data, error } = await supabase
        .from('gamification_profiles')
        .upsert(
            {
                user_id: userId,
                total_xp: newTotalXp,
                level: newLevel,
                league: newLeague,
                last_active_at: new Date().toISOString()
            },
            {
                onConflict: 'user_id'
            }
        )
        .select('*')
        .single();

    if (error) {
        throw new AppError(400, error.message);
    }

    return data;
}