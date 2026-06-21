import { supabase } from '../../config/supabase.js';
import { AppError } from '../../utils/AppError.js';
import { addXp } from '../gamification/gamification.service.js';

export async function recordProgress(userId, conditionType) {
    await ensureCurrentMissions(userId);
    
    const { data: activeMissions, error: userMissionsError } = await supabase
        .from('user_missions')
        .select(`
      id,
      progress,
      mission:missions!inner(
        target_value,
        condition_type
      )
    `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .eq('missions.condition_type', conditionType);

    if (userMissionsError) {
        throw new AppError(500, userMissionsError.message);
    }

    for (const userMission of activeMissions) {
        const newProgress = userMission.progress + 1;

        const isCompleted =
            newProgress >= userMission.mission.target_value;

        const updateData = {
            progress: newProgress
        };

        if (isCompleted) {
            updateData.status = 'completed';
            updateData.completed_at = new Date().toISOString();
        }

        const { error: updateError } = await supabase
            .from('user_missions')
            .update(updateData)
            .eq('id', userMission.id);

        if (updateError) {
            throw new AppError(500, updateError.message);
        }
    }
}

export async function completeMission(userId, userMissionId) {
    const { data: userMission, error: userMissionError } = await supabase
        .from('user_missions')
        .select(`
      id,
      status,
      progress,
      mission:missions!inner(
        xp_reward,
        title
      )
    `)
        .eq('id', userMissionId)
        .eq('user_id', userId)
        .maybeSingle();

    if (userMissionError) {
        throw new AppError(500, userMissionError.message);
    }

    if (!userMission) {
        throw new AppError(404, 'Mision no encontrada');
    }

    if (userMission.status !== 'completed') {
        throw new AppError(
            400,
            'La mision aun no esta lista para reclamar'
        );
    }

    const previousLevel = null;

    const updatedProfile = await addXp(
        userId,
        userMission.mission.xp_reward,
        {
            sourceType: 'mission',
            sourceId: userMission.id,
            description: `Mision completada: ${userMission.mission.title}`
        }
    );

    const levelUp = updatedProfile.level > updatedProfile.previousLevel;

    const { error: claimError } = await supabase
        .from('user_missions')
        .update({
            status: 'claimed',
            claimed_at: new Date().toISOString()
        })
        .eq('id', userMission.id)
        .eq('status', 'completed');

    if (claimError) {
        throw new AppError(500, claimError.message);
    }

    const levelUp =
        previousLevel !== null &&
        updatedProfile.level > previousLevel;

    return {
        message: 'Mision completada exitosamente',
        xpEarned: userMission.mission.xp_reward,
        newTotalXp: updatedProfile.total_xp,
        levelUp,
        newLevel: levelUp ? updatedProfile.level : null
    };
}

function getExpirationForFrequency(frequency, now = new Date()) {
    if (frequency === 'daily') {
        return new Date(
            Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate() + 1,
                0,
                0,
                0
            )
        ).toISOString();
    }

    if (frequency === 'weekly') {
        const currentDay = now.getUTCDay(); // Domingo = 0, lunes = 1
        const daysUntilNextMonday = currentDay === 0 ? 1 : 8 - currentDay;

        return new Date(
            Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate() + daysUntilNextMonday,
                0,
                0,
                0
            )
        ).toISOString();
    }

    throw new AppError(400, 'Frecuencia de mision invalida');
}

/*
  Garantiza que el usuario tenga una instancia actual de cada misión activa.

  missions      = definición general de misión.
  user_missions = progreso personal del usuario.
*/
export async function ensureCurrentMissions(userId) {
    const { data: missions, error: missionsError } = await supabase
        .from('missions')
        .select('id, frequency')
        .eq('is_active', true);

    if (missionsError) {
        throw new AppError(500, missionsError.message);
    }

    const createdMissions = [];

    for (const mission of missions) {
        const expiresAt = getExpirationForFrequency(mission.frequency);

        const { data: existingMission, error: existingError } = await supabase
            .from('user_missions')
            .select('id')
            .eq('user_id', userId)
            .eq('mission_id', mission.id)
            .eq('expires_at', expiresAt)
            .maybeSingle();

        if (existingError) {
            throw new AppError(500, existingError.message);
        }

        // Ya tiene asignada esa misión para el periodo actual.
        if (existingMission) {
            continue;
        }

        const { data: newUserMission, error: insertError } = await supabase
            .from('user_missions')
            .insert({
                user_id: userId,
                mission_id: mission.id,
                expires_at: expiresAt
            })
            .select('id, mission_id, status, progress, expires_at')
            .single();

        if (insertError) {
            throw new AppError(500, insertError.message);
        }

        createdMissions.push(newUserMission);
    }

    return createdMissions;
}

/*
  Lista las misiones actuales del usuario.

  El id que se devuelve es user_missions.id.
  Ese será el id que mandarás luego a:
  POST /missions/:id/complete
*/
export async function getMissions(userId, filters = {}) {
    const { frequency, status } = filters;

    // Crea las misiones del periodo si todavía no existen.
    await ensureCurrentMissions(userId);

    let query = supabase
        .from('user_missions')
        .select(`
      id,
      status,
      progress,
      expires_at,
      completed_at,
      claimed_at,
      mission:missions!inner(
        id,
        title,
        description,
        frequency,
        xp_reward,
        condition_type,
        target_value
      )
    `)
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: true });

    if (frequency) {
        query = query.eq('missions.frequency', frequency);
    }

    if (status) {
        query = query.eq('status', status);
    }

    const { data: userMissions, error } = await query;

    if (error) {
        throw new AppError(500, error.message);
    }

    return userMissions.map((userMission) => ({
        id: userMission.id,
        title: userMission.mission.title,
        description: userMission.mission.description,
        frequency: userMission.mission.frequency,
        xpReward: userMission.mission.xp_reward,
        conditionType: userMission.mission.condition_type,
        status: userMission.status,
        progress: userMission.progress,
        expiresAt: userMission.expires_at
    }));
}