'use client'

import { Interview, JobApplication } from 'src/lib'
import { useState } from 'react'
import { Trash, ExternalLink } from 'lucide-react'
import { ShowDateTime } from './ShowDateTime'

type Props = {
	application: JobApplication
	onClose: () => void
}

export function InterviewsModal({ application, onClose }: Props) {
	const [localHistory, setLocalHistory] = useState<Interview[]>(() => JSON.parse(application.history))
	const handleDeleteInterview = async (date: number) => {
		const res = await fetch(`/api/interviews?id=${application.id}&date=${date}`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
		})

		if (res.ok) setLocalHistory(prev => prev.filter(i => i.date !== date))
		else console.error('Failed to delete interview')
	}

	return (
		<div className="modal modal-open">
			<div className="modal-box max-w-3xl">
				<h3 className="font-bold text-lg">Interview History</h3>

				{localHistory.length > 0 ? (
					<div className="overflow-x-auto mt-4">
						<table className="table table-zebra w-full text-sm">
							<thead>
								<tr>
									<th>Round</th>
									<th>Date</th>
									<th>Type</th>
									<th>Notes</th>
									<th>Link</th>
									<th>Delete</th>
								</tr>
							</thead>
							<tbody>
								{localHistory.map(interview => (
									<tr key={interview.date}>
										<td>{interview.round}</td>
										<td>
											<ShowDateTime dt={new Date(interview.date)} />
										</td>
										<td className="capitalize">{interview.type}</td>
										<td>{interview.notes}</td>
										<td>
											{interview.link ? (
												<a href={interview.link} target="_blank">
													<ExternalLink className="inline w-5 h-5 text-gray-800 dark:text-white hover:text-blue-500" />
												</a>
											) : (
												'-'
											)}
										</td>
										<td>
											<Trash
												aria-label="Delete interview"
												role="button"
												className="w-5 h-5 cursor-pointer text-gray-800 dark:text-white hover:text-red-500"
												onClick={() => handleDeleteInterview(interview.date)}
											/>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<div className="mt-4 text-gray-500">No interviews recorded yet.</div>
				)}

				<div className="modal-action">
					<button className="btn btn-outline btn-error" onClick={onClose}>
						Close
					</button>
				</div>
			</div>
		</div>
	)
}
