'use client'

import { useState } from 'react'
import { useApp } from '@/lib/context/app-context'
import { AnimalItem } from './animal-item'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

export function AnimalsList() {
  const { animals, selectedAnimalId, setSelectedAnimalId, setMapCenter, removeAnimal } = useApp()
  const [search, setSearch] = useState('')

  const filteredAnimals = animals.filter(animal =>
    animal.name.toLowerCase().includes(search.toLowerCase()) ||
    animal.trackerId.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelectAnimal = (animal: typeof animals[0]) => {
    setSelectedAnimalId(animal.id)
    if (animal.coordinates) {
      setMapCenter(animal.coordinates)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-sidebar-accent border-sidebar-border"
        />
      </div>
      
      <div className="flex flex-col gap-1 mt-2">
        {filteredAnimals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Животные не найдены
          </p>
        ) : (
          filteredAnimals.map(animal => (
            <AnimalItem
              key={animal.id}
              animal={animal}
              isSelected={selectedAnimalId === animal.id}
              onClick={() => handleSelectAnimal(animal)}
              onRemove={() => removeAnimal(animal.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
