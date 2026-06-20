import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

export const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.jti) {
      const { data: revoked } = await supabase
        .from('revoked_tokens')
        .select('id')
        .eq('jti', decoded.jti)
        .maybeSingle();

      if (revoked) {
        return res.status(401).json({ message: 'Token revocado' });
      }
    }

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Token invalido o expirado' });
  }
};
