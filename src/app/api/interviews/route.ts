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
	const { jobApplicationId, ...newInterview } = body
	const userEmail = session.user.email!

	if (first) {
		try {
			await dbClient.send(
				new UpdateCommand({
					TableName: TABLE_NAME,
					Key: { id: jobApplicationId, applicantEmailAddress: userEmail },
					UpdateExpression,
					ExpressionAttributeNames,
					ExpressionAttributeValues: {
						':interviewDate': newInterview.interviewDateTime,
						':interviewType': newInterview.interviewType,
						':interviewRound': newInterview.interviewRound ?? 1,
						':interviewNotes': newInterview.interviewNotes,
						':interviewLocation': newInterview.interviewLocation,
						':interviewLink': newInterview.interviewLink,
						':history': JSON.stringify([
							{
								date: newInterview.interviewDateTime,
								type: newInterview.interviewType,
								notes: newInterview.interviewNotes,
								round: newInterview.interviewRound,
								link: newInterview.interviewLink,
								location: newInterview.interviewLocation,
							},
						] as Interview[]),
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
		// Step 1: Fetch existing record
		const { Item: currentItem } = await dbClient.send(
			new GetCommand({
				TableName: TABLE_NAME,
				Key: { id: jobApplicationId, applicantEmailAddress: userEmail },
			})
		)

		if (!currentItem) return NextResponse.json({ error: 'Job application not found' }, { status: 404 })

		// Step 2: Update history array
		const currentHistory = currentItem.history ? (JSON.parse(currentItem.history) as Interview[]) : []

		const newInterviewInHistory: Interview = {
			date: newInterview.interviewDateTime,
			type: newInterview.interviewType,
			round: newInterview.interviewRound,
			notes: newInterview.interviewNotes,
			location: newInterview.interviewLocation,
			link: newInterview.interviewLink,
		}

		const updatedHistory = [...currentHistory, newInterviewInHistory].sort((a, b) => a.date - b.date)
		const upcomingInterview = updatedHistory[0]

		// Step 3: Save everything
		await dbClient.send(
			new UpdateCommand({
				TableName: TABLE_NAME,
				Key: { id: jobApplicationId, applicantEmailAddress: userEmail },
				UpdateExpression,
				ExpressionAttributeNames,
				ExpressionAttributeValues: {
					':interviewDate': upcomingInterview.date,
					':interviewType': upcomingInterview.type ?? '',
					':interviewRound': upcomingInterview.round ?? updatedHistory.length,
					':interviewNotes': upcomingInterview.notes ?? '',
					':interviewLocation': upcomingInterview.location ?? '',
					':interviewLink': upcomingInterview.link ?? '',
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
