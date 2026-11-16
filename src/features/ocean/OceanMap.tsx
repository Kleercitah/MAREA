import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import type { MultiPolygon, Position } from 'geojson'
import 'leaflet/dist/leaflet.css'
import { useLanguage } from '../../i18n/Language'
import { labels } from './labels'
import { cellAt, rasterImage, type Bounds, type Raster } from './data'

type Point = { lat: number; lng: number }
export type Selection = Point & { value: number | null; status: 'land' | 'outside' | 'empty' | 'valid' }

function inRing(p: Point, ring: Position[]) {
  let inside = false
  for (let i = 0, j = ring.length-1; i < ring.length; j = i++) {
    const [x,y] = ring[i], [xx,yy] = ring[j]
    if ((y > p.lat) !== (yy > p.lat) && p.lng < (xx-x)*(p.lat-y)/(yy-y)+x) inside = !inside
  }
  return inside
}

export function OceanMap({ bounds, land, raster, opacity, onSelect }: {
  bounds: Bounds; land: MultiPolygon; raster?: Raster | undefined; opacity: number
  onSelect: (selection: Selection) => void
}) {
  const { language } = useLanguage()
  const t = labels[language]
  const host = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<L.Map>()
  const overlay = useRef<L.ImageOverlay | null>(null)
  const fit = (m: L.Map) => m.fitBounds(bounds, { padding: [24, 28], animate: false })
  useEffect(() => {
    const m = L.map(host.current!, { crs: L.CRS.EPSG4326, zoomControl: false, zoomAnimation: false, zoomSnap: 0.1,
      maxZoom: 13, minZoom: 6, maxBounds: L.latLngBounds(bounds).pad(0.7), scrollWheelZoom: false })
    m.attributionControl.setPrefix(false)
    m.createPane('islands').style.zIndex = '420'
    L.geoJSON(land, { pane: 'islands', interactive: false, style: {
      fillColor: '#364454', color: '#acbdba', weight: 1, fillOpacity: 1,
    }, attribution: '<a href="https://www.naturalearthdata.com/">Natural Earth</a> · Leaflet' }).addTo(m)
    L.rectangle(bounds, { color: '#c6d5de', fill: false, weight: 1, dashArray: '5 5', interactive: false }).addTo(m)
    for (const [name, lat, lng] of [
      ['Isabela', -0.57, -91.16], ['Fernandina', -0.37, -91.57], ['Santa Cruz', -0.65, -90.34],
      ['San Cristóbal', -0.84, -89.44], ['Santiago', -0.24, -90.77], ['Pinta', 0.58, -90.75],
    ] as const) {
      L.marker([lat,lng], { interactive: false, keyboard: false, icon: L.divIcon({
        className: 'island-label', html: name, iconSize: [90,16], iconAnchor: [45,8],
      }) }).addTo(m)
    }
    L.control.scale({ imperial: false, maxWidth: 75 }).addTo(m)
    fit(m)
    setMap(m)
    const resize = new ResizeObserver(() => { m.invalidateSize() })
    resize.observe(host.current!)
    return () => { resize.disconnect(); m.remove() }
  }, [land, bounds])

  useEffect(() => {
    if (!map || !raster) return
    const { north, west, height, width, step } = raster.layer
    const image = L.imageOverlay(rasterImage(raster), [[north-height*step, west], [north, west+width*step]],
      { className: 'ocean-raster', interactive: false }).addTo(map)
    overlay.current = image
    let pin: L.CircleMarker | undefined
    const pick = (p: Point) => {
      const cell = cellAt(raster, p.lat, p.lng)
      const isLand = land.coordinates.some(([outer, ...holes]) => inRing(p, outer) && !holes.some(h => inRing(p,h)))
      const selection: Selection = isLand ? { ...p, status: 'land', value: null }
        : cell ? { ...cell, status: cell.value === null ? 'empty' : 'valid' } : { ...p, status: 'outside', value: null }
      pin?.remove()
      pin = L.circleMarker([selection.lat, selection.lng], { radius: 6, color: 'white', weight: 2,
        fillColor: '#101b36', fillOpacity: .8, pane: 'markerPane', interactive: false }).addTo(map)
      onSelect(selection)
    }
    const click = (e: L.LeafletMouseEvent) => pick(e.latlng)
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && e.target === map.getContainer()) { e.preventDefault(); pick(map.getCenter()) }
    }
    map.on('click', click)
    map.getContainer().addEventListener('keydown', key)
    return () => {
      image.remove(); pin?.remove(); overlay.current = null
      map.off('click',click); map.getContainer().removeEventListener('keydown', key)
    }
  }, [map, raster, land, onSelect])
  useEffect(() => { overlay.current?.setOpacity(opacity / 100) }, [opacity, map, raster])

  return <div className="ocean-map-frame">
    <div className="ocean-map" ref={host} aria-label={t.map} role="region" />
    <div className="map-tools"><button aria-label={t.zoomIn} onClick={() => map?.zoomIn()}>+</button>
      <button aria-label={t.zoomOut} onClick={() => map?.zoomOut()}>−</button>
      <button aria-label={t.reset} title={t.reset} onClick={() => map && fit(map)}>⌖</button></div>
  </div>
}
