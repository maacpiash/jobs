import type { JobApplication } from 'src/lib'

type Props = {
	applications: JobApplication[]
}

export function JobApplicationsTable({ applications }: Props) {
	return (
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
						<td>{app.applicationDate ? new Date(app.applicationDate).toLocaleDateString() : 'N/A'}</td>
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
					</tr>
				))}
			</tbody>
		</table>
	)
}
