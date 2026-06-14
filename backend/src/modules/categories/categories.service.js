import { supabase } from '../../config/supabase.js';
import { AppError } from '../../utils/AppError.js';

export async function getCategories({ type }) {
  let query = supabase
    .from('categories')
    .select('id, name, type, icon')
    .order('name', { ascending: true });

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError(400, error.message);
  }

  return data;
}