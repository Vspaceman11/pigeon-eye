'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface TaskMapHandle {
  centerOnUser: () => void
}

export interface MapIssue {
  id: string
  lat: number
  lng: number
  severity: 'EASY' | 'MEDIUM' | 'HIGH'
  category?: string | null
  status: string
  imageUrl?: string | null
}

interface TaskMapInnerProps {
  tasks: MapIssue[]
  onTaskClick?: (id: string) => void
}

const severityColors: Record<string, string> = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  EASY: '#22c55e',
}

const statusSymbol: Record<string, string> = {
  pending: '⏳',
  analyzing: '🔍',
  done: '✓',
  error: '!',
}

export const TaskMapInner = forwardRef<TaskMapHandle, TaskMapInnerProps>(
  function TaskMapInner({ tasks, onTaskClick }, ref) {
    const mapContainerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<L.Map | null>(null)
    const markersRef = useRef<L.Marker[]>([])
    const userMarkerRef = useRef<L.Marker | null>(null)

    useImperativeHandle(ref, () => ({
      centerOnUser() {
        if (!navigator.geolocation || !mapRef.current) return
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords
            mapRef.current!.setView([lat, lng], 16, { animate: true })

            if (userMarkerRef.current) userMarkerRef.current.remove()

            const icon = L.divIcon({
              className: '',
              html: `<div style="
                width:18px;height:18px;border-radius:50%;
                background:#3b82f6;border:3px solid white;
                box-shadow:0 0 0 6px rgba(59,130,246,0.25);
              "></div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            })
            userMarkerRef.current = L.marker([lat, lng], { icon }).addTo(mapRef.current!)
          },
          () => {},
          { enableHighAccuracy: true, timeout: 8000 },
        )
      },
    }))

    useEffect(() => {
      if (!mapContainerRef.current || mapRef.current) return

      mapRef.current = L.map(mapContainerRef.current).setView([49.1427, 9.2109], 14)

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 20,
          subdomains: ['a', 'b', 'c', 'd'],
        },
      ).addTo(mapRef.current)

      return () => {
        if (mapRef.current) {
          mapRef.current.remove()
          mapRef.current = null
        }
      }
    }, [])

    useEffect(() => {
      if (!mapRef.current) return

      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      tasks.forEach((issue) => {
        const color = severityColors[issue.severity] ?? '#f59e0b'
        const sym = statusSymbol[issue.status] ?? '?'

        const svgIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="position:relative;cursor:pointer;">
              <svg width="40" height="48" viewBox="0 0 48 56" fill="none">
                <path d="M24 0C10.74 0 0 10.74 0 24C0 42 24 56 24 56S48 42 48 24C48 10.74 37.26 0 24 0Z" fill="${color}"/>
                <circle cx="24" cy="22" r="14" fill="white"/>
              </svg>
              <span style="position:absolute;top:8px;left:0;width:40px;text-align:center;font-size:14px;line-height:24px;">
                ${sym}
              </span>
            </div>
          `,
          iconSize: [40, 48],
          iconAnchor: [20, 48],
        })

        const marker = L.marker([issue.lat, issue.lng], { icon: svgIcon })
          .addTo(mapRef.current!)
          .on('click', () => onTaskClick?.(issue.id))

        markersRef.current.push(marker)
      })
    }, [tasks, onTaskClick])

    return <div ref={mapContainerRef} className="h-full w-full" style={{ minHeight: '100%' }} />
  },
)
