'use client'

import { RefObject } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
	modalRef?: RefObject<HTMLDialogElement | null>
	jobApplicationId?: string
	firstInterview?: boolean
}

export function InterviewForm({ modalRef, jobApplicationId, firstInterview }: Props) {
	const router = useRouter()
	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const formData = new FormData(event.currentTarget)
		const { interviewDate, interviewTime, ...payload } = Object.fromEntries(formData.entries())
		const interviewDateTime = new Date(`${interviewDate} ${interviewTime}`).getTime()
		console.table(payload)
		const response = await fetch('/api/interviews' + (firstInterview ? '?first=1' : ''), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ interviewDateTime, ...payload }),
		})
		modalRef?.current?.close()
		if (response.ok) {
			event.currentTarget.reset()
			router.refresh()
		}
	}

	const closeModal = () => modalRef?.current?.close()

	return (
		<form className="max-w-2xl p-6 mx-auto space-y-4 shadow rounded-xl bg-base-100" onSubmit={handleSubmit}>
			<h3 className="text-xl font-semibold">Interview Info</h3>
			{jobApplicationId && <input type="hidden" name="jobApplicationId" value={jobApplicationId} />}

			<div className="form-control">
				<label htmlFor="dateIntDate" className="label">
					<span className="label-text">Date</span>
				</label>
				<input id="dateIntDate" type="date" name="interviewDate" className="input" required />
			</div>

			<div className="form-control">
				<label htmlFor="dateIntTime" className="label">
					<span className="label-text">Time</span>
				</label>
				<input id="dateIntTime" type="time" name="interviewTime" className="input" required />
			</div>

			<div className="form-control">
				<label htmlFor="selIntType" className="label">
					<span className="label-text">Type</span>
				</label>
				<select id="selIntType" name="interviewType" className="select select-bordered">
					<option value="technical">Technical</option>
					<option value="behavioral">Behavioral</option>
					<option value="face-to-face">Face-to-face</option>
					<option value="other">Other</option>
				</select>
			</div>

			<div className="form-control">
				<label htmlFor="txtIntRound" className="label">
					<span className="label-text">Round</span>
				</label>
				<input
					id="txtIntRound"
					name="interviewRound"
					type="number"
					inputMode="numeric"
					className="input input-bordered"
				/>
			</div>

			<div className="form-control">
				<label htmlFor="txtIntNotes" className="label">
					<span className="label-text">Interview Notes</span>
				</label>
				<textarea id="txtIntNotes" name="interviewNotes" className="textarea textarea-bordered" />
			</div>

			<div className="form-control">
				<label htmlFor="txtIntLocation" className="label">
					<span className="label-text">Location</span>
				</label>
				<input id="txtIntLocation" name="interviewLocation" className="input input-bordered" />
			</div>

			<div className="form-control">
				<label htmlFor="txtIntLink" className="label">
					<span className="label-text">Link</span>
				</label>
				<input id="txtIntLink" name="interviewLink" type="url" className="input input-bordered" />
			</div>

			<div className="flex flex-row justify-between">
				<button type="button" className="btn btn-secondary btn-outline" onClick={closeModal}>
					Cancel
				</button>

				<button type="submit" className="btn btn-primary">
					Submit
				</button>
			</div>
		</form>
	)
}
