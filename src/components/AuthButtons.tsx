'use client'

import { Github, Linkedin } from 'iconoir-react'
import { signIn, signOut } from 'next-auth/react'

export function SignInButtons() {
	return (
		<div className="flex flex-col gap-4">
			<button type="button" onClick={() => signIn('github')} className="btn btn-primary">
				<Github />
				Sign in with GitHub
			</button>

			<button type="button" onClick={() => signIn('linkedin')} className="btn btn-secondary">
				<Linkedin />
				Sign in with LinkedIn
			</button>
		</div>
	)
}

export function SignOutButton() {
	return (
		<button type="button" onClick={() => signOut()} className="btn btn-secondary">
			Sign out
		</button>
	)
}
