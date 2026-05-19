'use client'

import { TrackerSyncInitializer } from '@/components/tracker-sync-initializer'
import { AppProvider } from '@/lib/context/app-context'
import { Toaster } from 'sonner'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<AppProvider>
			<TrackerSyncInitializer />
			<div className='flex h-screen overflow-hidden bg-background'>{children}</div>
			<Toaster
				position='bottom-right'
				offset={{ right: 16, bottom: 112 }}
				mobileOffset={{ right: 16, bottom: 112, left: 16 }}
				theme='dark'
				toastOptions={{
					style: {
						background: 'var(--background)',
						border: '1px solid var(--border)',
						color: 'var(--foreground)',
					},
				}}
			/>
		</AppProvider>
	)
}
