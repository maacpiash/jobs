'use client'

import { useEffect, useRef, type ReactNode, type ReactElement } from 'react'

type DropDownProps = {
	title: ReactNode
	children: ReactElement<'li'> | ReactElement<'li'>[]
	summaryStyle?: string
	ulStyle?: string
}

export function DropDown({ title, children, summaryStyle, ulStyle }: DropDownProps) {
	const dropdownRef = useRef<HTMLDetailsElement>(null)

	useEffect(() => {
		const handleClickAnywhere = () => dropdownRef.current?.removeAttribute('open')
		document.addEventListener('click', handleClickAnywhere)
		return () => document.removeEventListener('click', handleClickAnywhere)
	}, [])

	return (
		<details ref={dropdownRef} className="dropdown">
			<summary className={summaryStyle ?? 'list-none cursor-pointer'}>{title}</summary>
			<ul
				className={`z-10 p-2 shadow-sm menu dropdown-content bg-base-100 rounded-box w-36 ${ulStyle ?? ''}`}
				onClick={() => dropdownRef.current?.removeAttribute('open')}
			>
				{children}
			</ul>
		</details>
	)
}
