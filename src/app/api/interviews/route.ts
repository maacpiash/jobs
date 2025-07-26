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

export async function DELETE(req: NextRequest) {
	const session = await auth()
	if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	if (!TABLE_NAME) throw new Error('DYNAMODB_TABLE_NAME is not defined in environment')
	const id = req.nextUrl.searchParams.get('id')
	if (!id) return NextResponse.json({ error: 'Missing job application ID' }, { status: 400 })
	const date = req.nextUrl.searchParams.get('date')
	if (!date) return NextResponse.json({ error: 'Missing interview date' }, { status: 400 })

	try {
		// Step 1: Fetch existing record
		const { Item: currentItem } = await dbClient.send(
			new GetCommand({
				TableName: TABLE_NAME,
				Key: { id, applicantEmailAddress: session.user.email as string },
			})
		)

		if (!currentItem) return NextResponse.json({ error: 'Job application not found' }, { status: 404 })
		const currentHistory = currentItem.history ? (JSON.parse(currentItem.history) as Interview[]) : []
		if (currentHistory.length === 0) return NextResponse.json({ error: 'No interviews to delete' }, { status: 400 })

		const newHistory = currentHistory.filter(h => h.date !== parseInt(date))
		const onlyOneInterview = currentHistory.length === 1 && newHistory.length === 0

		let updateExpression = 'SET #history = :history, #updatedAt = :updatedAt'
		const exprAttrNames: Record<string, string> = {
			'#history': 'history',
			'#updatedAt': 'updatedAt',
		}
		const exprAttrValues: Record<string, string | number> = {
			':history': JSON.stringify(newHistory),
			':updatedAt': Date.now(),
		}

		if (onlyOneInterview) {
			// Unset all interview-related fields
			updateExpression += `
				REMOVE #interviewDate, #interviewType, #interviewRound, #interviewNotes, #interviewLocation, #interviewLink`

			Object.assign(exprAttrNames, {
				'#interviewDate': 'interviewDate',
				'#interviewType': 'interviewType',
				'#interviewRound': 'interviewRound',
				'#interviewNotes': 'interviewNotes',
				'#interviewLocation': 'interviewLocation',
				'#interviewLink': 'interviewLink',
			})
		} else if (newHistory.length > 0) {
			const nextInterview = newHistory[0]

			updateExpression += `,
				#interviewDate = :interviewDate,
				#interviewType = :interviewType,
				#interviewRound = :interviewRound,
				#interviewNotes = :interviewNotes,
				#interviewLocation = :interviewLocation,
				#interviewLink = :interviewLink`

			Object.assign(exprAttrNames, {
				'#interviewDate': 'interviewDate',
				'#interviewType': 'interviewType',
				'#interviewRound': 'interviewRound',
				'#interviewNotes': 'interviewNotes',
				'#interviewLocation': 'interviewLocation',
				'#interviewLink': 'interviewLink',
			})

			Object.assign(exprAttrValues, {
				':interviewDate': nextInterview.date,
				':interviewType': nextInterview.type ?? '',
				':interviewRound': nextInterview.round ?? newHistory.length,
				':interviewNotes': nextInterview.notes ?? '',
				':interviewLocation': nextInterview.location ?? '',
				':interviewLink': nextInterview.link ?? '',
			})
		}

		await dbClient.send(
			new UpdateCommand({
				TableName: TABLE_NAME,
				Key: { id, applicantEmailAddress: session.user.email as string },
				UpdateExpression: updateExpression,
				ExpressionAttributeNames: exprAttrNames,
				ExpressionAttributeValues: exprAttrValues,
			})
		)
		return NextResponse.json({ message: 'Interview deleted successfully' })
	} catch (err) {
		console.error('Error deleting interview:', err)
		return NextResponse.json({ error: 'Failed to delete interview' }, { status: 500 })
	}
}
