'use client'

import { useState, ReactNode } from 'react'
import { useApp } from '@/lib/context/app-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { MAP_CENTER } from '@/lib/data/mock-data'

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
    
    if (!name.trim() || !trackerId.trim()) return
    
    // Создаём животное с случайными координатами около центра
    const offsetLat = (Math.random() - 0.5) * 0.008
    const offsetLng = (Math.random() - 0.5) * 0.008
    
    addAnimal({
      name: name.trim(),
      trackerId: trackerId.trim().toUpperCase(),
      coordinates: {
        lat: MAP_CENTER.lat + offsetLat,
        lng: MAP_CENTER.lng + offsetLng
      },
      status: 'online',
      batteryLevel: Math.floor(Math.random() * 40) + 60
    })
    
    setName('')
    setTrackerId('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Добавить животное</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Кличка</Label>
            <Input
              id="name"
              placeholder="Например: Барашек"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trackerId">ID трекера</Label>
            <Input
              id="trackerId"
              placeholder="Например: TRK-007"
              value={trackerId}
              onChange={(e) => setTrackerId(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit">
              Добавить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
