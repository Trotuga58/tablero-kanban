import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabase/server';
import { LoginForm } from '@/components/LoginForm';

export const metadata = { title: 'Entrar · Tablero Kanban' };

export default async function LoginPage() {
  const { user } = await getUser();
  if (user) redirect('/boards');

  return (
    <section className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold">Entra o crea tu cuenta</h1>
      <LoginForm />
    </section>
  );
}
