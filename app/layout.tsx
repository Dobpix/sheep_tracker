import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: 'Smart Animals - Мониторинг животных',
	description: 'Система дистанционного мониторинга положения сельскохозяйственных животных с GPS-трекерами',
	icons: {
		icon: { url: '/favicon.ico', sizes: 'any' },
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='ru' className='dark bg-background'>
			<body className='font-sans antialiased'>
				{children}
				{process.env.NODE_ENV === 'production' && <Analytics />}
			</body>
		</html>
	)
}
