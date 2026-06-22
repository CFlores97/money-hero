import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

export async function buildGraphQLContext(req) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return { user: null };
  }

  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded.jti) {
    const { data: revoked } = await supabase
      .from('revoked_tokens')
      .select('id')
      .eq('jti', decoded.jti)
      .maybeSingle();

    if (revoked) return { user: null };
  }

  return { user: decoded };
}