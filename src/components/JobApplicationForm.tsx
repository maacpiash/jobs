'use client'

import { RefObject, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export function JobApplicationForm({ modalRef }: { modalRef?: RefObject<HTMLDialogElement | null> }) {
	const router = useRouter()
	const [loading, setLoading] = useState(false)
	const formRef = useRef<HTMLFormElement>(null)

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		if (!formRef.current) return
		setLoading(true)

		const formData = new FormData(formRef.current)
		const payload = Object.fromEntries(formData.entries())
		console.table(payload)
		modalRef?.current?.close()

		const res = await fetch('/api/job-applications', {
			method: 'POST',
			body: JSON.stringify(payload),
			headers: { 'Content-Type': 'application/json' },
		})

		if (res.ok) {
			router.refresh()
			formRef.current.reset()
		}
		setLoading(false)
	}

	return (
		<form
			ref={formRef}
			onSubmit={handleSubmit}
			className="max-w-2xl p-6 mx-auto space-y-4 shadow rounded-xl bg-base-100"
		>
			<h2 className="text-2xl font-bold">New Job Application</h2>

			<div className="form-control">
				<label htmlFor="txtCompany" className="label">
					<span className="label-text">Company</span>
				</label>
				<input id="txtCompany" name="company" className="input input-bordered" required />
			</div>

			<div className="form-control">
				<label htmlFor="txtPosition" className="label">
					<span className="label-text">Position</span>
				</label>
				<input id="txtPosition" name="position" className="input input-bordered" required />
			</div>

			<div className="form-control">
				<label htmlFor="txtLocation" className="label">
					<span className="label-text">Location</span>
				</label>
				<input id="txtLocation" name="location" className="input input-bordered" required />
			</div>

			<div className="form-control">
				<label htmlFor="txtSalary" className="label">
					<span className="label-text">Salary</span>
				</label>
				<input id="txtSalary" name="salary" type="number" className="input input-bordered" />
			</div>

			<div className="form-control">
				<label htmlFor="txtDescription" className="label">
					<span className="label-text">Description</span>
				</label>
				<textarea id="txtDescription" name="description" className="textarea textarea-bordered" />
			</div>

			<div className="form-control">
				<label htmlFor="txtAppDate" className="label">
					<span className="label-text">Application Date</span>
				</label>
				<input id="txtAppDate" type="date" name="applicationDate" className="input" />
			</div>

			<div className="form-control">
				<label htmlFor="selOutcome" className="label">
					<span className="label-text">Outcome</span>
				</label>
				<select id="selOutcome" name="outcome" className="select select-bordered">
					<option value="pending">Pending</option>
					<option value="unlikely">Unlikely</option>
					<option value="rejected">Rejected</option>
					<option value="advanced">Advanced</option>
				</select>
			</div>

			<div className="form-control">
				<label htmlFor="txtNotes" className="label">
					<span className="label-text">Notes</span>
				</label>
				<textarea id="txtNotes" name="notes" className="textarea textarea-bordered" />
			</div>

			<div className="flex flex-row justify-between">
				<button
					type="button"
					className="btn btn-secondary btn-outline"
					onClick={() => modalRef?.current?.close()}
				>
					Cancel
				</button>

				<button type="submit" className="btn btn-primary" disabled={loading}>
					{loading ? 'Submitting...' : 'Submit'}
				</button>
			</div>
		</form>
	)
}
