import { supabase } from '../../config/supabase.js';
import { AppError } from '../../utils/AppError.js';

function mapNotification(row) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    message: row.message,
    readStatus: row.read_status,
    createdAt: row.created_at
  };
}

export async function listNotifications(userId, readStatus) {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (readStatus !== undefined) {
    query = query.eq('read_status', readStatus);
  }

  const { data, error } = await query;
  if (error) throw new AppError(400, error.message);
  return data.map(mapNotification);
}

export async function markAsRead(userId, notificationId) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read_status: true })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error || !data) throw new AppError(404, 'Notificacion no encontrada');
  return mapNotification(data);
}

export async function markAllAsRead(userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ read_status: true })
    .eq('user_id', userId)
    .eq('read_status', false);

  if (error) throw new AppError(400, error.message);
  return { message: 'Todas las notificaciones fueron marcadas como leidas' };
}
