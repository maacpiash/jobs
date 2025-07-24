import { NextRequest, NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { auth } from 'src/auth'
import { Interview } from 'src/lib'

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-southeast-2' })
const dbClient = DynamoDBDocumentClient.from(client)

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME

const UpdateExpression = `
	SET
		#interviewDate = :interviewDate,
		#interviewTime = :interviewTime,
		#interviewType = :interviewType,
		#interviewRound = :interviewRound,
		#interviewNotes = :interviewNotes,
		#interviewLocation = :interviewLocation,
		#interviewLink = :interviewLink,
		#history = :history,
		#updatedAt = :updatedAt
`

const ExpressionAttributeNames = {
	'#interviewDate': 'interviewDate',
	'#interviewTime': 'interviewTime',
	'#interviewType': 'interviewType',
	'#interviewRound': 'interviewRound',
	'#interviewNotes': 'interviewNotes',
	'#interviewLocation': 'interviewLocation',
	'#interviewLink': 'interviewLink',
	'#history': 'history',
	'#updatedAt': 'updatedAt',
}

export async function POST(req: NextRequest) {
	if (!TABLE_NAME) return NextResponse.json({ error: 'DYNAMODB_TABLE_NAME is not defined' }, { status: 500 })
	const session = await auth()
	if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	const body = await req.json()
	if (!body.jobApplicationId) return NextResponse.json({ error: 'Missing job application ID' }, { status: 400 })
	const first = req.nextUrl.searchParams.get('first')
	console.log('FIRST INTERVIEW:', first)
	const { jobApplicationId, ...newInterview } = body
	const userEmail = session.user.email!

	if (first) {
		console.log('Saving first interview for job application:', jobApplicationId)
		try {
			await dbClient.send(
				new UpdateCommand({
					TableName: TABLE_NAME,
					Key: { id: jobApplicationId, applicantEmailAddress: userEmail },
					UpdateExpression,
					ExpressionAttributeNames,
					ExpressionAttributeValues: {
						':interviewDate': newInterview.interviewDate,
						':interviewTime': newInterview.interviewTime,
						':interviewType': newInterview.interviewType,
						':interviewRound': newInterview.interviewRound,
						':interviewNotes': newInterview.interviewNotes,
						':interviewLocation': newInterview.interviewLocation,
						':interviewLink': newInterview.interviewLink,
						':history': '[]',
						':updatedAt': Date.now(),
					},
				})
			)
			return NextResponse.json({ message: 'Interview saved successfully' }, { status: 201 })
		} catch (err) {
			console.error('Error saving job application:', err)
			return NextResponse.json({ error: 'Failed to save interview' }, { status: 500 })
		}
	}

	try {
		console.log('NOT FIRST:', jobApplicationId)
		// Step 1: Fetch existing record
		const existing = await dbClient.send(
			new GetCommand({
				TableName: TABLE_NAME,
				Key: { id: jobApplicationId, applicantEmailAddress: userEmail },
			})
		)

		const currentItem = existing.Item
		if (!currentItem) return NextResponse.json({ error: 'Job application not found' }, { status: 404 })

		// Step 2: Extract existing interview fields into an Interview object
		const previousInterview: Interview = {
			date: currentItem.interviewDate,
			type: currentItem.interviewType,
			notes: currentItem.interviewNotes,
			round: currentItem.interviewRound,
			link: currentItem.interviewLink,
			location: currentItem.interviewLocation,
		}

		// Step 3: Update history array
		const currentHistory = currentItem.history ? (JSON.parse(currentItem.history) as Interview[]) : []

		const updatedHistory = [...currentHistory, previousInterview]

		// Step 4: Save everything in a single update
		await dbClient.send(
			new UpdateCommand({
				TableName: TABLE_NAME,
				Key: { id: jobApplicationId, applicantEmailAddress: userEmail },
				UpdateExpression,
				ExpressionAttributeNames,
				ExpressionAttributeValues: {
					':interviewDate': newInterview.interviewDate,
					':interviewTime': newInterview.interviewTime,
					':interviewType': newInterview.interviewType,
					':interviewRound': newInterview.interviewRound,
					':interviewNotes': newInterview.interviewNotes,
					':interviewLocation': newInterview.interviewLocation,
					':interviewLink': newInterview.interviewLink,
					':history': JSON.stringify(updatedHistory),
					':updatedAt': Date.now(),
				},
			})
		)
		return NextResponse.json({ message: 'Interview saved successfully' }, { status: 201 })
	} catch (err) {
		console.error('Error saving job application:', err)
		return NextResponse.json({ error: 'Failed to save interview' }, { status: 500 })
	}
}
