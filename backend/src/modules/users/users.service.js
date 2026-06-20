import { supabase } from '../../config/supabase.js';
import { AppError } from '../../utils/AppError.js';
import { mapUser } from '../../utils/mappers.js';

export async function getMe(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, avatar, created_at')
    .eq('id', userId)
    .single();

  if (error || !data) throw new AppError(404, 'Usuario no encontrado');
  return mapUser(data);
}

export async function updateMe(userId, payload) {
  const updates = {};
  if (payload.name !== undefined) updates.name = payload.name;
  if (payload.avatar !== undefined) updates.avatar = payload.avatar;

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select('id, name, email, avatar, created_at')
    .single();

  if (error || !data) throw new AppError(400, 'No se pudo actualizar el perfil');
  return mapUser(data);
}
