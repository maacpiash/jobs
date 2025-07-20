import type { Interview } from './Interview'

type BaseJobApplication = {
	id: string
	applicantEmailAddress: string
	company: string
	position: string
	location?: string
	salary?: number
	description?: string
	applicationDate: string
	outcome: 'pending' | 'unlikely' | 'rejected' | 'advanced'
	nextInterviewDate?: number // UNIX Timestamp in milliseconds
	history: string // JSON stringified array of `Interview` objects
	createdAt: number
	updatedAt: number
	notes?: string
}

export type JobApplication = BaseJobApplication & Interview
