import { Suspense } from 'react'
import { auth } from 'src/auth'
import { SignInButton, SignOutButton, ShowFormModal } from 'src/components'
import { JobApplications } from 'src/components'

export default async function Home() {
	const session = await auth()

	if (!session || !session.user) {
		return (
			<main className="flex flex-col items-center justify-center min-h-screen p-4">
				<p className="mb-4 text-lg">Please sign in to track your job applications.</p>
				<SignInButton />
			</main>
		)
	}

	return (
		<>
			<header className="flex items-center justify-between p-4">
				<h1 className="text-2xl font-bold">Job Application Tracker</h1>
				<p className="text-lg">Signed in as {session.user.name}</p>
				<SignOutButton />
			</header>
			<main className="w-full p-6 shadow bg-base-100 rounded-xl">
				<div className="flex flex-row items-center justify-between mb-4">
					<h2 className="mb-4 text-2xl font-bold">Your Job Applications</h2>
					<ShowFormModal />
				</div>
				<Suspense
					fallback={
						<div className="flex items-center justify-center h-64">
							<span className="loading loading-infinity loading-xl"></span>
						</div>
					}
				>
					<JobApplications />
				</Suspense>
			</main>
			<footer className="fixed bottom-0 flex flex-wrap items-center justify-center w-full p-4 text-gray-500">
				<a href="https://github.com/maacpiash/Jobs" target="_blank" rel="noopener noreferrer" className="mr-4">
					GitHub Repository
				</a>
			</footer>
		</>
	)
}
