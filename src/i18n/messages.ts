import type { SectionId } from '../app/sections'

export type Language = 'es' | 'en'
interface Messages {
  nav: string
  menu: string
  skip: string
  observatory: string
  location: string
  hero: [string, string]
  intro: string
  explore: string
  marine: string
  directory: string
  pending: string
  back: string
  missing: string
  sources: string
  sections: Record<SectionId, { name: string; description: string }>
}

export const messages: Record<Language, Messages> = {
  es: {
    nav: 'Navegación principal', menu: 'Menú', skip: 'Saltar al contenido',
    observatory: 'Observatorio marino', location: 'Galápagos, Ecuador',
    hero: ['El océano de', 'Galápagos.'],
    intro: 'Una mirada a las aguas del archipiélago, la huella de El Niño y las cinco especies que nos acercan a su vida marina.',
    explore: 'Explorar océano', marine: 'Conocer la vida marina',
    directory: 'Dentro del observatorio', pending: 'En desarrollo',
    back: 'Volver al inicio', missing: 'Página no encontrada',
    sources: 'Fuentes y metodología',
    sections: {
      home: { name: 'Inicio', description: '' },
      ocean: { name: 'Explorador oceánico', description: 'Las regiones marinas de Galápagos a través de observaciones satelitales.' },
      trends: { name: 'Detective climático', description: 'Series temporales y tendencias para estudiar cómo cambia el océano.' },
      species: { name: 'Vida marina', description: 'Cinco especies y su relación con las condiciones del archipiélago.' },
      signals: { name: 'Señales de hábitat', description: 'Indicadores ambientales que dan contexto al hábitat de las especies.' },
      timeline: { name: 'Cronología de El Niño', description: 'Episodios históricos de El Niño y sus referencias estacionales.' },
      report: { name: 'Informe científico', description: 'Fuentes, metodología y limitaciones de los análisis del observatorio.' },
    },
  },
  en: {
    nav: 'Main navigation', menu: 'Menu', skip: 'Skip to content',
    observatory: 'Marine observatory', location: 'Galápagos, Ecuador',
    hero: ['The ocean of', 'Galápagos.'],
    intro: 'A closer look at the waters of the archipelago, the influence of El Niño and five species that reveal its marine life.',
    explore: 'Explore the ocean', marine: 'Meet the marine life',
    directory: 'Inside the observatory', pending: 'In development',
    back: 'Back to home', missing: 'Page not found', sources: 'Sources and methodology',
    sections: {
      home: { name: 'Home', description: '' },
      ocean: { name: 'Ocean Explorer', description: 'Satellite observations of the marine regions around Galápagos.' },
      trends: { name: 'Climate Detective', description: 'Time series and trends for studying how the ocean changes.' },
      species: { name: 'Marine Life', description: 'Five species and their relationship with conditions in the archipelago.' },
      signals: { name: 'Habitat Signals', description: 'Environmental indicators that give context to species habitats.' },
      timeline: { name: 'El Niño Timeline', description: 'Historical El Niño events and their seasonal reference periods.' },
      report: { name: 'Scientific Report', description: 'Sources, methodology and limitations of the observatory’s analyses.' },
    },
  },
}
