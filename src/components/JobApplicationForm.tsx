'use client'

import { RefObject, useEffect, useRef } from 'react'
import type { FormEvent } from 'react'

export function JobApplicationForm({ modalRef }: { modalRef?: RefObject<HTMLDialogElement | null> }) {
	const formRef = useRef<HTMLFormElement>(null)
	const appDatePicker = useRef(null)

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let picker: any
		// Dynamically import Pikaday to avoid SSR issues
		import('pikaday').then(({ default: Pikaday }) => {
			picker = new Pikaday({ field: appDatePicker.current })
		})
		return () => picker?.destroy()
	}, [])

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		if (!formRef.current) return

		const formData = new FormData(formRef.current)
		const payload = Object.fromEntries(formData.entries())
		console.table(payload)
		modalRef?.current?.close()

		// await fetch('/api/job-applications', {
		// 	method: 'POST',
		// 	body: JSON.stringify(payload),
		// })
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
				<input
					id="txtAppDate"
					type="text"
					name="applicationDate"
					className="input pika-single"
					defaultValue={new Date().toISOString().split('T')[0]}
					ref={appDatePicker}
					inputMode="none"
				/>
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

				<button type="submit" className="btn btn-primary">
					Submit
				</button>
			</div>
		</form>
	)
}
