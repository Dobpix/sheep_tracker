'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/lib/context/app-context'
import { Check, X } from 'lucide-react'
import { useState } from 'react'

const ZONE_COLORS = [
	'#22c55e', // green
	'#3b82f6', // blue
	'#eab308', // yellow
	'#f97316', // orange
	'#8b5cf6', // purple
]

export function ZoneDrawingControls() {
	const { isDrawingZone, drawingCoordinates, finishDrawingZone, cancelDrawingZone, addZone } = useApp()

	const [showSaveDialog, setShowSaveDialog] = useState(false)
	const [zoneName, setZoneName] = useState('')
	const [selectedColor, setSelectedColor] = useState(ZONE_COLORS[0])

	if (!isDrawingZone) return null

	const handleFinish = () => {
		if (drawingCoordinates.length >= 3) {
			setShowSaveDialog(true)
		}
	}

	const handleSave = () => {
		const coords = finishDrawingZone()
		if (coords.length >= 3 && zoneName.trim()) {
			addZone(zoneName.trim(), coords, selectedColor)
		}
		setZoneName('')
		setSelectedColor(ZONE_COLORS[0])
		setShowSaveDialog(false)
	}

	const handleCancel = () => {
		cancelDrawingZone()
		setZoneName('')
		setShowSaveDialog(false)
	}

	return (
		<>
			<div className='absolute left-4 top-4 z-[1100] max-w-[calc(100%-2rem)]'>
				<div className='flex flex-wrap items-center gap-2 rounded-lg bg-card/95 border border-border px-3 py-2.5 shadow-lg backdrop-blur-sm'>
					<div className='text-sm'>
						<span className='text-muted-foreground'>Точек: </span>
						<span className='font-medium text-foreground'>{drawingCoordinates.length}</span>
					</div>

					<div className='h-4 w-px bg-border mx-1' />

					<Button size='sm' variant='outline' onClick={handleCancel} className='gap-1.5'>
						<X className='h-4 w-4' />
						Отмена
					</Button>

					<Button size='sm' onClick={handleFinish} disabled={drawingCoordinates.length < 3} className='gap-1.5'>
						<Check className='h-4 w-4' />
						Завершить
					</Button>
				</div>
			</div>

			<Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
				<DialogContent className='sm:max-w-md'>
					<DialogHeader>
						<DialogTitle>Сохранить зону</DialogTitle>
					</DialogHeader>
					<div className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='zoneName'>Название зоны</Label>
							<Input
								id='zoneName'
								placeholder='Например: Северное пастбище'
								value={zoneName}
								onChange={e => setZoneName(e.target.value)}
							/>
						</div>
						<div className='space-y-2'>
							<Label>Цвет</Label>
							<div className='flex gap-2'>
								{ZONE_COLORS.map(color => (
									<button
										key={color}
										type='button'
										onClick={() => setSelectedColor(color)}
										className={`h-8 w-8 rounded-md transition-all ${
											selectedColor === color ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
										}`}
										style={{ backgroundColor: color }}
									/>
								))}
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant='outline' onClick={handleCancel}>
							Отмена
						</Button>
						<Button onClick={handleSave} disabled={!zoneName.trim()}>
							Сохранить
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}
