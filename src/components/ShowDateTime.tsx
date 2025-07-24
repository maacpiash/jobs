export function ShowDateTime({ dt }: { dt: Date }) {
	return (
		<div className="flex flex-col">
			<span className="text">{dt.toISOString().split('T')[0]}</span>
			<span className="text-sm text-gray-500">
				{dt.toLocaleTimeString('en-AU', {
					hour: '2-digit',
					minute: '2-digit',
				})}
			</span>
		</div>
	)
}
