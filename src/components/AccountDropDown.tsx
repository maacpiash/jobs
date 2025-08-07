import { DropDown, SignOutButton } from '.'

type Props = { profilePicture: string; userEmail: string }

export function AccountDropDown({ profilePicture, userEmail }: Props) {
	return (
		<DropDown
			// eslint-disable-next-line @next/next/no-img-element
			title={<img src={profilePicture} alt={userEmail} width={36} height={36} />}
			detailsStyle="dropdown-end"
			ulStyle="w-48 border border-gray-300"
		>
			<li className="mt-2">
				<div className="flex flex-col w-44">
					<span className="text text-sm text-gray-500">Signed in as</span>
					<span className="text max-w-40 truncate">{userEmail}</span>
				</div>
			</li>
			<li className="mt-2">
				<span className="text p-4">Account settings</span>
			</li>
			<li className="mt-2">
				<SignOutButton />
			</li>
		</DropDown>
	)
}
