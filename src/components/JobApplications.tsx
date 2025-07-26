import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { auth } from 'src/auth'
import { JobApplication } from 'src/lib'
import { JobApplicationsTable } from '.'

const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION ?? 'ap-southeast-2' }))

export async function JobApplications() {
	const session = await auth()
	if (!session?.user?.email) {
		return <p className="text-center text-gray-500">Unable to load applications.</p>
	}

	const command = new QueryCommand({
		TableName: process.env.DYNAMODB_TABLE_NAME!,
		KeyConditionExpression: 'applicantEmailAddress = :email',
		ExpressionAttributeValues: {
			':email': session.user.email,
		},
	})

	const result = await client.send(command)
	const applications: JobApplication[] = (result.Items as JobApplication[]) ?? []

	if (applications.length === 0) return <p className="text-center text-gray-500">No applications found.</p>

	return <JobApplicationsTable applications={applications} />
}
