'use client';

import { useActionState } from 'react';
import { signIn, signUp, type AuthState } from '@/app/login/actions';

export function LoginForm() {
  const [signInState, signInAction, signingIn] = useActionState<AuthState, FormData>(signIn, {});
  const [signUpState, signUpAction, signingUp] = useActionState<AuthState, FormData>(signUp, {});
  const state = signUpState.error || signUpState.message ? signUpState : signInState;
  const pending = signingIn || signingUp;

  return (
    <form className="space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 focus:border-stone-900 focus:outline-none"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Contraseña</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="current-password"
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 focus:border-stone-900 focus:outline-none"
        />
      </label>

      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      {state.message && <p role="status" className="text-sm text-green-700">{state.message}</p>}

      <div className="flex gap-2">
        <button
          formAction={signInAction}
          disabled={pending}
          className="flex-1 rounded-md bg-stone-900 px-4 py-2 font-medium text-white hover:bg-stone-700 disabled:opacity-50"
        >
          Entrar
        </button>
        <button
          formAction={signUpAction}
          disabled={pending}
          className="flex-1 rounded-md border border-stone-300 px-4 py-2 font-medium hover:bg-stone-100 disabled:opacity-50"
        >
          Crear cuenta
        </button>
      </div>
    </form>
  );
}
