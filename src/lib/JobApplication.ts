import type { Interview } from './Interview'

type BaseJobApplication = {
	id: string
	applicantEmailAddress: string
	company: string
	position: string
	location?: string
	salary?: number
	description?: string
	applicationDate?: string
	outcome: 'pending' | 'unlikely' | 'rejected' | 'advanced'
	history: string // JSON stringified array of `Interview` objects
	createdAt: number
	updatedAt: number
	notes?: string
}

type PrefixPropNamesWithString<T, Prefix extends string> = {
	[K in keyof T as `${Prefix}${Capitalize<string & K>}`]: T[K]
}

export type JobApplication = BaseJobApplication & PrefixPropNamesWithString<Interview, 'interview'>
