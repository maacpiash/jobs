'use client'

import { useRef } from 'react'
import { JobApplicationForm } from '.'

export function ShowFormModal() {
	const modalRef = useRef<HTMLDialogElement>(null)
	return (
		<>
			<button className="btn btn-primary btn-outline" onClick={() => modalRef.current?.show()}>
				Add new
			</button>
			<dialog ref={modalRef} className="modal">
				<JobApplicationForm modalRef={modalRef} />
			</dialog>
		</>
	)
}
