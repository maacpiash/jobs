import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { auth } from 'src/auth'
import { SignInButton, SignOutButton, JobApplicationsTable, ShowFormModal } from 'src/components'
import { JobApplication } from 'src/lib'

const client = DynamoDBDocumentClient.from(
	new DynamoDBClient({
		region: process.env.AWS_REGION || 'ap-southeast-2',
	})
)

export default async function Home() {
	const session = await auth()
	const command = new QueryCommand({
		TableName: process.env.DYNAMODB_TABLE_NAME!,
		KeyConditionExpression: 'applicantEmailAddress = :email',
		ExpressionAttributeValues: {
			':email': session?.user?.email,
		},
	})

	const result = await client.send(command)
	const applications: JobApplication[] = (result.Items as JobApplication[]) ?? []

	return (
		<>
			<header className="flex items-center justify-between p-4">
				<h1 className="text-2xl font-bold">Job Application Tracker</h1>
				{session?.user ? (
					<>
						<p className="text-lg">Signed in as {session.user.name}</p>
						<SignOutButton />
					</>
				) : (
					<SignInButton />
				)}
			</header>
			{session?.user ? (
				<main className="w-full p-6 shadow bg-base-100 rounded-xl">
					<div className="flex flex-row items-center justify-between mb-4">
						<h2 className="mb-4 text-2xl font-bold">Your Job Applications</h2>
						<ShowFormModal />
					</div>
					{applications.length > 0 ? (
						<JobApplicationsTable applications={applications} />
					) : (
						<p className="text-center text-gray-500">No applications found.</p>
					)}
				</main>
			) : (
				<main className="flex flex-col items-center justify-center min-h-screen p-4">
					<p className="mb-4 text-lg">Please sign in to track your job applications.</p>
					<SignInButton />
				</main>
			)}
			<footer className="fixed bottom-0 flex flex-wrap items-center justify-center w-full p-4 text-gray-500">
				<a href="https://github.com/maacpiash/Jobs" target="_blank" rel="noopener noreferrer" className="mr-4">
					GitHub Repository
				</a>
			</footer>
		</>
	)
}
