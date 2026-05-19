'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/lib/context/app-context'
import { ReactNode, useState } from 'react'

interface AddAnimalDialogProps {
	children: ReactNode
}

export function AddAnimalDialog({ children }: AddAnimalDialogProps) {
	const { addAnimal } = useApp()
	const [open, setOpen] = useState(false)
	const [name, setName] = useState('')
	const [trackerId, setTrackerId] = useState('')

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		if (!name.trim() || !trackerId.trim()) {
			return
		}

		addAnimal({
			name: name.trim(),
			trackerId: trackerId.trim(),
			coordinates: null,
			status: 'offline',
			batteryLevel: 0,
			satellites: 0,
			hasGpsSignal: false,
		})
		setName('')
		setTrackerId('')
		setOpen(false)
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>Добавить животное</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='name'>Кличка</Label>
						<Input
							id='name'
							placeholder='Например: Барашек'
							value={name}
							onChange={e => setName(e.target.value)}
							required
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='trackerId'>ID трекера</Label>
						<Input
							id='trackerId'
							placeholder='Например: 101'
							value={trackerId}
							onChange={e => setTrackerId(e.target.value)}
							required
						/>
					</div>
					<DialogFooter>
						<Button type='button' variant='outline' onClick={() => setOpen(false)}>
							Отмена
						</Button>
						<Button type='submit'>Добавить</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
