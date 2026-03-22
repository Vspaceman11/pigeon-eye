/** City center fallback when GPS / EXIF / API coords are missing or invalid */
export const HEILBRONN_DEFAULT = { lat: 49.1427, lng: 9.2109 } as const

/** True if coordinates are safe to show on the urban map (not missing / null island) */
export function hasUsableMapCoordinates(
  latitude: number | undefined | null,
  longitude: number | undefined | null,
): boolean {
  if (latitude == null || longitude == null) return false
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false
  if (latitude === 0 && longitude === 0) return false
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return false
  return true
}

export function resolveMapCoordinates(
  latitude: number | undefined | null,
  longitude: number | undefined | null,
): { lat: number; lng: number } {
  if (hasUsableMapCoordinates(latitude, longitude)) {
    return { lat: latitude as number, lng: longitude as number }
  }
  return { lat: HEILBRONN_DEFAULT.lat, lng: HEILBRONN_DEFAULT.lng }
}
