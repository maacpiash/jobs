export type Interview = {
	date: number
	type?: 'technical' | 'behavioral' | 'face-to-face' | 'other'
	notes?: string
	round: number
	link?: string
	location?: string
}
