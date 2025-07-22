import { NextRequest, NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { auth } from 'src/auth'

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-southeast-2' })
const dbClient = DynamoDBDocumentClient.from(client)

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME

export async function POST(req: NextRequest) {
	const session = await auth()
	if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	try {
		if (!TABLE_NAME) throw new Error('DYNAMODB_TABLE_NAME is not defined in environment')
		const body = await req.json()
		if (!body.jobApplicationId) return NextResponse.json({ error: 'Missing job application ID' }, { status: 400 })
		const { jobApplicationId, ...rest } = body
		const payload = { id: jobApplicationId, applicantEmailId: session.user.email, ...rest }

		await dbClient.send(
			new UpdateCommand({
				TableName: TABLE_NAME,
				Key: { id: body.jobApplicationId, applicantEmailId: session.user.email },
				UpdateExpression: 'set #data = :data',
				ExpressionAttributeNames: { '#data': 'data' },
				ExpressionAttributeValues: { ':data': payload },
			})
		)
		return NextResponse.json({ message: 'Interview saved successfully' }, { status: 201 })
	} catch (err) {
		console.error('Error saving job application:', err)
		return NextResponse.json({ error: 'Failed to save interview' }, { status: 500 })
	}
}
