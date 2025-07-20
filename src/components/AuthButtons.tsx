'use client'

import { signIn, signOut } from 'next-auth/react'

export function SignInButton() {
	return (
		<button type="button" onClick={() => signIn('github')} className="btn btn-primary">
			Sign in with GitHub
		</button>
	)
}

export function SignOutButton() {
	return (
		<button type="button" onClick={() => signOut()} className="btn btn-secondary">
			Sign out
		</button>
	)
}
