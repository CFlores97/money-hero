import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../../config/supabase.js';
import { AppError } from '../../utils/AppError.js';
import { sanitizeUser } from '../../utils/sanitizeUser.js';

function singToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, jti: randomUUID() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

export async function register({ name, email, password }) {
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingUser) throw new AppError(400, 'Correo ya registrado');

  const passwordHash = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabase
    .from('users')
    .insert({ name, email, password_hash: passwordHash })
    .select('id, name, email, avatar, created_at')
    .single();

  if (error) throw new AppError(400, error.message);

  const { error: profileError } = await supabase
    .from('gamification_profiles')
    .insert({ user_id: user.id });

  if (profileError) throw new AppError(400, profileError.message);

  return { token: singToken(user), user: sanitizeUser(user) };
}

export async function login({ email, password }) {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error || !user) throw new AppError(401, 'Credenciales incorrectas');

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) throw new AppError(401, 'Contraseña incorrecta');

  return { token: singToken(user), user: sanitizeUser(user) };
}

export async function logout(decodedToken) {
  if (!decodedToken.jti) return { message: 'Sesion cerrada exitosamente' };

  const expiresAt = new Date(decodedToken.exp * 1000).toISOString();

  const { error } = await supabase.from('revoked_tokens').insert({
    jti: decodedToken.jti,
    user_id: decodedToken.id,
    expires_at: expiresAt
  });

  if (error && error.code !== '23505') throw new AppError(400, error.message);
  return { message: 'Sesion cerrada exitosamente' };
}
