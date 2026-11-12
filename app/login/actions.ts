'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface AuthState {
  error?: string;
  message?: string;
}

function credentials(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!email || password.length < 6) return null;
  return { email, password };
}

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const creds = credentials(formData);
  if (!creds) return { error: 'Escribe tu email y una contraseña de al menos 6 caracteres.' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(creds);
  if (error) return { error: 'Email o contraseña incorrectos.' };

  redirect('/boards');
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const creds = credentials(formData);
  if (!creds) return { error: 'Escribe tu email y una contraseña de al menos 6 caracteres.' };

  const origin = (await headers()).get('origin') ?? '';
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...creds,
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  });
  if (error) return { error: error.message };

  // Si el proyecto no pide confirmar el email, la sesión ya está abierta.
  if (data.session) redirect('/boards');
  return { message: 'Te hemos enviado un email para confirmar la cuenta.' };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
