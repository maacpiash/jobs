import type { Metadata } from 'next'
import { Raleway } from 'next/font/google'
import './globals.css'

export const metadata: Metadata = {
	title: 'Jobs',
	description: 'Track your job applications with ease',
}

const raleway = Raleway({
	variable: '--font-raleway',
	subsets: ['latin'],
})

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body className={`${raleway.variable} antialiased`}>{children}</body>
		</html>
	)
}
