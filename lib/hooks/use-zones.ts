'use client'

import { useState, useCallback } from 'react'
import type { Zone, Coordinates } from '@/lib/types'
import { mockZones } from '@/lib/data/mock-data'

export function useZones() {
  const [zones, setZones] = useState<Zone[]>(mockZones)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingCoordinates, setDrawingCoordinates] = useState<Coordinates[]>([])

  const addZone = useCallback((name: string, coordinates: Coordinates[], color: string) => {
    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name,
      coordinates,
      color
    }
    setZones(prev => [...prev, newZone])
    return newZone
  }, [])

  const removeZone = useCallback((id: string) => {
    setZones(prev => prev.filter(z => z.id !== id))
  }, [])

  const startDrawing = useCallback(() => {
    setIsDrawing(true)
    setDrawingCoordinates([])
  }, [])

  const addPoint = useCallback((coord: Coordinates) => {
    setDrawingCoordinates(prev => [...prev, coord])
  }, [])

  const finishDrawing = useCallback(() => {
    setIsDrawing(false)
    const coords = drawingCoordinates
    setDrawingCoordinates([])
    return coords
  }, [drawingCoordinates])

  const cancelDrawing = useCallback(() => {
    setIsDrawing(false)
    setDrawingCoordinates([])
  }, [])

  return {
    zones,
    isDrawing,
    drawingCoordinates,
    addZone,
    removeZone,
    startDrawing,
    addPoint,
    finishDrawing,
    cancelDrawing
  }
}
