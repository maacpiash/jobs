'use client'

import { useRef, useState, type ReactElement } from 'react'
import { useRouter } from 'next/navigation'
import type { JobApplication } from 'src/lib'
import { DropDown, InterviewForm, ShowDateTime } from '.'
import { InterviewsModal } from '.'

type StatusType = JobApplication['outcome']
const statuses: StatusType[] = ['pending', 'unlikely', 'rejected', 'advanced']

const jobAppStatusMap: Record<StatusType, string> = {
	advanced: 'badge-success',
	pending: 'badge-secondary',
	rejected: 'badge-error',
	unlikely: 'badge-warning',
}

type Props = {
	applications: JobApplication[]
}

export function JobApplicationsTable({ applications }: Props) {
	const router = useRouter()
	const modalRef = useRef<HTMLDialogElement>(null)
	const [jobAppId, setJobAppId] = useState<string | null>(null)
	const [firstInterview, setFirstInterview] = useState(false)
	const [showModal, setShowModal] = useState(false)
	return (
		<>
			<table className="table table-zebra">
				<thead>
					<tr>
						<th>Company</th>
						<th>Position</th>
						<th>Location</th>
						<th>Salary</th>
						<th className="max-w-xs">Description</th>
						<th>Applied On</th>
						<th>Outcome</th>
						<th>Next interview</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{applications.map((app, idx) => (
						<tr key={idx}>
							<td>{app.company}</td>
							<td>{app.position}</td>
							<td>{app.location}</td>
							<td>{app.salary}</td>
							<td className="max-w-xs truncate" title={app.description}>
								{app.description}
							</td>
							<td>
								{app.applicationDate
									? new Date(app.applicationDate).toISOString().split('T')[0]
									: 'N/A'}
							</td>
							<td>
								<DropDown
									title={app.outcome}
									summaryStyle={`capitalize list-none cursor-pointer badge ${jobAppStatusMap[app.outcome]} m-1`}
									ulStyle="w-36"
								>
									{statuses.reduce((acc, status) => {
										if (status !== app.outcome)
											acc.push(
												<li key={status} className="p-2">
													<button
														className={`capitalize badge ${jobAppStatusMap[status]}`}
														onClick={() => {
															fetch(`/api/job-applications?id=${app.id}`, {
																method: 'PUT',
																headers: { 'Content-Type': 'application/json' },
																body: JSON.stringify({ outcome: status }),
															})
																.then(res => {
																	if (res.ok) router.refresh()
																})
																.catch(console.error)
														}}
													>
														{status}
													</button>
												</li>
											)
										return acc
									}, [] as ReactElement<'li'>[])}
								</DropDown>
							</td>
							<td>{app.interviewDate ? <ShowDateTime dt={new Date(app.interviewDate)} /> : 'N/A'}</td>
							<td>
								<DropDown title="Actions" summaryStyle="m-1 btn">
									<li>
										<button
											onClick={() => {
												setJobAppId(app.id)
												setFirstInterview(!app.interviewDate)
												modalRef.current?.showModal()
											}}
										>
											Add interview
										</button>
									</li>
									<li>
										<button
											onClick={() => {
												setJobAppId(app.id)
												setShowModal(true)
											}}
										>
											View interviews
										</button>
									</li>
									<li>
										<button
											className="text-red-500"
											onClick={async () => {
												const response = await fetch(`/api/job-applications?id=${app.id}`, {
													method: 'DELETE',
													headers: { 'Content-Type': 'application/json' },
												})
												if (response.ok) router.refresh()
											}}
										>
											Delete
										</button>
									</li>
								</DropDown>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<dialog ref={modalRef} className="modal">
				<InterviewForm
					modalRef={modalRef}
					jobApplicationId={jobAppId as string}
					firstInterview={firstInterview}
				/>
			</dialog>
			{showModal && (
				<InterviewsModal
					application={applications.filter(app => app.id === jobAppId)[0]}
					onClose={() => setShowModal(false)}
				/>
			)}
		</>
	)
}
