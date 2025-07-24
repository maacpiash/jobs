'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { JobApplication } from 'src/lib'
import { InterviewForm, ShowDateTime } from '.'

type Props = {
	applications: JobApplication[]
}

export function JobApplicationsTable({ applications }: Props) {
	const router = useRouter()
	const modalRef = useRef<HTMLDialogElement>(null)
	const [jobAppId, setJobAppId] = useState<string | null>(null)
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
								<span
									className={`badge ${
										app.outcome === 'advanced'
											? 'badge-success'
											: app.outcome === 'pending'
												? 'badge-warning'
												: app.outcome === 'rejected' || app.outcome === 'unlikely'
													? 'badge-error'
													: ''
									}`}
								>
									{app.outcome}
								</span>
							</td>
							<td>{app.interviewDate ? <ShowDateTime dt={new Date(app.interviewDate)} /> : 'N/A'}</td>
							<td>
								<details
									className="dropdown"
									ref={el => {
										if (el) (app as any)._detailsRef = el
									}}
								>
									<summary className="m-1 btn">Actions</summary>
									<ul className="z-10 p-2 shadow-sm menu dropdown-content bg-base-100 rounded-box w-52">
										<li>
											<button
												onClick={() => {
													modalRef.current?.show()
													setJobAppId(app.id)
													;(app as any)._detailsRef?.removeAttribute('open')
												}}
											>
												Add interview
											</button>
										</li>
										<li>
											<button
												className="text-red-500"
												onClick={async () => {
													const response = await fetch(`/api/job-applications?id=${app.id}`, {
														method: 'DELETE',
														headers: {
															'Content-Type': 'application/json',
														},
													})
													if (response.ok) router.refresh()
													;(app as any)._detailsRef?.removeAttribute('open')
												}}
											>
												Delete
											</button>
										</li>
									</ul>
								</details>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<dialog ref={modalRef} className="modal">
				<InterviewForm modalRef={modalRef} jobApplicationId={jobAppId as string} />
			</dialog>
		</>
	)
}
