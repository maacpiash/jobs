export default function Home() {
	return (
		<>
			<header>
				<form action="/api/auth/signin" method="POST">
					<input type="hidden" name="provider" value="github" />
					<button
						type="submit"
						className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
					>
						Sign in with GitHub
					</button>
				</form>
			</header>
			<main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
				<article className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
					<h3>Hello, Employer!</h3>
					<p>
						Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed volutpat, enim in facilisis
						tincidunt, nisi erat lacinia ligula, nec commodo enim nisi at quam. Donec non libero velit. Sed
						in ligula at enim facilisis tincidunt. Nullam velit enim, commodo in ligula vel, facilisis
						tincidunt
					</p>
				</article>
			</main>
			<footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
				<p>This website uses no cookies, trackers, or analytics.</p>
			</footer>
		</>
	)
}
