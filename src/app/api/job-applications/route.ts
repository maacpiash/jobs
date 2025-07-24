import { NextRequest, NextResponse } from 'next/server'
import { DeleteItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { PutCommand, DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { auth } from 'src/auth'

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-southeast-2' })
const dbClient = DynamoDBDocumentClient.from(client)

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME

export async function POST(req: NextRequest) {
	const session = await auth()
	if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	if (!TABLE_NAME) throw new Error('DYNAMODB_TABLE_NAME is not defined in environment')
	const body = await req.json()

	const requiredFields = ['company', 'position']
	for (const field of requiredFields) {
		if (!body[field]) return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
	}

	body.id = crypto.randomUUID()
	body.applicantEmailAddress = session.user.email

	try {
		await dbClient.send(new PutCommand({ TableName: TABLE_NAME, Item: body }))
		return NextResponse.json({ message: 'Job application saved successfully' }, { status: 201 })
	} catch (err) {
		console.error('Error saving job application:', err)
		return NextResponse.json({ error: 'Failed to save job application' }, { status: 500 })
	}
}

export async function PUT(req: NextRequest) {
	const session = await auth()
	if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	if (!TABLE_NAME) throw new Error('DYNAMODB_TABLE_NAME is not defined in environment')
	const body = await req.json()
	const id = req.nextUrl.searchParams.get('id')
	if (!id) return NextResponse.json({ error: 'Missing job application ID' }, { status: 400 })
	if (!body.outcome) return NextResponse.json({ error: 'Missing required field: outcome' }, { status: 400 })
	if (!['pending', 'unlikely', 'rejected', 'advanced'].includes(body.outcome)) {
		return NextResponse.json({ error: 'Invalid outcome value' }, { status: 400 })
	}
	const cmd = new UpdateCommand({
		TableName: TABLE_NAME,
		Key: { id, applicantEmailAddress: session.user.email as string },
		UpdateExpression: `SET #outcome = :outcome`,
		ExpressionAttributeNames: { '#outcome': 'outcome' },
		ExpressionAttributeValues: {
			':outcome': body.outcome,
		},
	})
	try {
		await dbClient.send(cmd)
		return NextResponse.json({ message: 'Job application updated successfully' })
	} catch (err) {
		console.error('Error updating job application:', err)
		return NextResponse.json({ error: 'Failed to update job application' }, { status: 500 })
	}
}

export async function DELETE(req: NextRequest) {
	const session = await auth()
	if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	if (!TABLE_NAME) throw new Error('DYNAMODB_TABLE_NAME is not defined in environment')
	const id = req.nextUrl.searchParams.get('id')
	if (!id) return NextResponse.json({ error: 'Missing job application ID' }, { status: 400 })

	try {
		await dbClient.send(
			new DeleteItemCommand({
				TableName: TABLE_NAME,
				Key: { id: { S: id as string }, applicantEmailAddress: { S: session.user.email as string } },
				ConditionExpression: 'id = :id AND applicantEmailAddress = :email',
				ExpressionAttributeValues: {
					':email': { S: session.user.email as string },
					':id': { S: id },
				},
			})
		)

		return NextResponse.json({ message: 'Job application deleted successfully' })
	} catch (err) {
		console.error('Error deleting job application:', err)
		return NextResponse.json({ error: 'Failed to delete job application' }, { status: 500 })
	}
}
