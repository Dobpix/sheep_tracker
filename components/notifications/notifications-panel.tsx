'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApp } from '@/lib/context/app-context'
import { cn } from '@/lib/utils'
import { AlertTriangle, Battery, Bell, WifiOff, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function NotificationsPanel() {
	const { notifications, markNotificationRead } = useApp()
	const [isOpen, setIsOpen] = useState(false)
	const [shownNotifications, setShownNotifications] = useState<Set<string>>(new Set())

	const unreadCount = notifications.filter(n => !n.read).length

	// Показываем toast для новых уведомлений
	useEffect(() => {
		notifications.forEach(notif => {
			if (!notif.read && !shownNotifications.has(notif.id)) {
				const icon =
					notif.type === 'zone_exit' ? (
						<AlertTriangle className='h-4 w-4 text-yellow-500' />
					) : notif.type === 'connection_lost' ? (
						<WifiOff className='h-4 w-4 text-red-500' />
					) : notif.type === 'gps_lost' ? (
						<AlertTriangle className='h-4 w-4 text-orange-500' />
					) : (
						<Battery className='h-4 w-4 text-orange-500' />
					)

				toast(notif.message, {
					icon,
					duration: 5000,
					action: {
						label: 'Показать',
						onClick: () => setIsOpen(true),
					},
				})

				setShownNotifications(prev => new Set(prev).add(notif.id))
			}
		})
	}, [notifications, shownNotifications])

	const getIcon = (type: string) => {
		switch (type) {
			case 'zone_exit':
				return <AlertTriangle className='h-4 w-4 text-yellow-500' />
			case 'connection_lost':
				return <WifiOff className='h-4 w-4 text-red-500' />
			case 'gps_lost':
				return <AlertTriangle className='h-4 w-4 text-orange-500' />
			case 'low_battery':
				return <Battery className='h-4 w-4 text-orange-500' />
			default:
				return <Bell className='h-4 w-4' />
		}
	}

	const formatTime = (date: Date) => {
		const now = new Date()
		const diff = now.getTime() - date.getTime()
		const minutes = Math.floor(diff / 60000)

		if (minutes < 1) return 'Только что'
		if (minutes < 60) return `${minutes} мин. назад`
		const hours = Math.floor(minutes / 60)
		if (hours < 24) return `${hours} ч. назад`
		return `${Math.floor(hours / 24)} дн. назад`
	}

	return (
		<>
			{/* Toggle button */}
			<Button
				aria-label='Уведомления'
				variant='ghost'
				size='icon'
				className='absolute right-4 bottom-4 z-[1200] h-12 w-12 rounded-full border border-border bg-background shadow-lg hover:bg-background'
				onClick={() => setIsOpen(!isOpen)}
			>
				<Bell className='h-5 w-5' />
				{unreadCount > 0 && (
					<span className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white'>
						{unreadCount}
					</span>
				)}
			</Button>

			{/* Panel */}
			{isOpen && (
				<Card className='absolute right-4 bottom-20 z-[1200] w-80 border-border bg-background shadow-xl'>
					<CardHeader className='flex flex-row items-center justify-between pb-2'>
						<CardTitle className='text-base'>Уведомления</CardTitle>
						<Button variant='ghost' size='icon' className='h-8 w-8' onClick={() => setIsOpen(false)}>
							<X className='h-4 w-4' />
						</Button>
					</CardHeader>
					<CardContent className='p-0'>
						<ScrollArea className='h-64'>
							{notifications.length === 0 ? (
								<div className='flex flex-col items-center justify-center py-8 text-center'>
									<Bell className='h-8 w-8 text-muted-foreground mb-2' />
									<p className='text-sm text-muted-foreground'>Нет уведомлений</p>
								</div>
							) : (
								<div className='divide-y divide-border'>
									{notifications.map(notif => (
										<button
											key={notif.id}
											onClick={() => markNotificationRead(notif.id)}
											className={cn(
												'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50',
												!notif.read && 'bg-muted/30',
											)}
										>
											<div className='mt-0.5'>{getIcon(notif.type)}</div>
											<div className='flex-1 min-w-0'>
												<p
													className={cn(
														'text-sm',
														!notif.read ? 'font-medium text-foreground' : 'text-muted-foreground',
													)}
												>
													{notif.message}
												</p>
												<p className='text-xs text-muted-foreground mt-1'>{formatTime(notif.timestamp)}</p>
											</div>
											{!notif.read && <span className='h-2 w-2 rounded-full bg-primary' />}
										</button>
									))}
								</div>
							)}
						</ScrollArea>
					</CardContent>
				</Card>
			)}
		</>
	)
}
