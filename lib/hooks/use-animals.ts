'use client'

import { useState, useCallback } from 'react'
import type { Animal } from '@/lib/types'
import { mockAnimals } from '@/lib/data/mock-data'

export function useAnimals() {
  const [animals, setAnimals] = useState<Animal[]>(mockAnimals)
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null)

  const addAnimal = useCallback((animal: Omit<Animal, 'id' | 'history' | 'lastSeen'>) => {
    const newAnimal: Animal = {
      ...animal,
      id: `animal-${Date.now()}`,
      history: [],
      lastSeen: new Date()
    }
    setAnimals(prev => [...prev, newAnimal])
    return newAnimal
  }, [])

  const removeAnimal = useCallback((id: string) => {
    setAnimals(prev => prev.filter(a => a.id !== id))
    if (selectedAnimalId === id) {
      setSelectedAnimalId(null)
    }
  }, [selectedAnimalId])

  const updateAnimal = useCallback((id: string, updates: Partial<Animal>) => {
    setAnimals(prev => prev.map(a => 
      a.id === id ? { ...a, ...updates } : a
    ))
  }, [])

  const selectedAnimal = animals.find(a => a.id === selectedAnimalId) || null

  return {
    animals,
    selectedAnimal,
    selectedAnimalId,
    setSelectedAnimalId,
    addAnimal,
    removeAnimal,
    updateAnimal
  }
}
