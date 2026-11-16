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
  read: string
  evidence: {
    title: string
    lead: string
    period: string
    temperature: string
    episode: string
    decade: string
    temperatureMonths: string
    chlorophyllMonths: string
    notSignificant: string
    episodeNote: string
    source: string
  }
  explore: string
  marine: string
  directory: string
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
    intro: 'Dos variables satelitales, veintidós años de observación y cinco especies para leer cómo cambia el mar de Galápagos.',
    read: 'Leer el informe científico',
    evidence: {
      title: 'El océano que observamos',
      lead: 'Galápagos se levanta donde confluyen corrientes frías y cálidas: la surgencia ecuatorial aporta nutrientes y sostiene una vida marina densa, expuesta a El Niño. El observatorio sigue la temperatura superficial y la clorofila-a de esa región entre 2003 y 2024 con productos satelitales de NASA y NOAA.',
      period: 'Periodo observado',
      temperature: 'Temperatura superficial',
      episode: 'El Niño 2015–2016',
      decade: 'por década',
      temperatureMonths: 'meses de temperatura',
      chlorophyllMonths: 'meses de clorofila-a',
      notSignificant: 'El registro completo no muestra una tendencia estadísticamente significativa.',
      episodeNote: 'Agua más cálida y con {percent} % menos clorofila-a que la referencia de los mismos meses.',
      source: 'Valores publicados por el motor estadístico del observatorio.',
    },
    explore: 'Explorar océano', marine: 'Conocer la vida marina',
    directory: 'Dentro del observatorio',
    back: 'Volver al inicio', missing: 'Página no encontrada',
    sources: 'Fuentes y metodología',
    sections: {
      home: { name: 'Inicio', description: '' },
      ocean: { name: 'Explorador oceánico', description: 'Las regiones marinas de Galápagos a través de observaciones satelitales.' },
      trends: { name: 'Detective climático', description: 'Series temporales y tendencias para estudiar cómo cambia el océano.' },
      species: { name: 'Vida marina', description: 'Cinco especies y su relación con las condiciones del archipiélago.' },
      signals: { name: 'Señales de hábitat', description: 'Indicadores ambientales que dan contexto al hábitat de las especies.' },
      timeline: { name: 'Cronología de El Niño', description: 'Episodios históricos de El Niño y sus referencias estacionales.' },
      report: { name: 'Informe científico', description: 'Síntesis científica: preguntas, datos, resultados y límites del observatorio.' },
    },
  },
  en: {
    nav: 'Main navigation', menu: 'Menu', skip: 'Skip to content',
    observatory: 'Marine observatory', location: 'Galápagos, Ecuador',
    hero: ['The ocean of', 'Galápagos.'],
    intro: 'Two satellite variables, twenty-two years of observation and five species to read how the Galápagos sea changes.',
    read: 'Read the Scientific Report',
    evidence: {
      title: 'The ocean we observe',
      lead: 'Galápagos rises where cold and warm currents meet: equatorial upwelling brings nutrients and sustains dense marine life exposed to El Niño. The observatory follows sea surface temperature and chlorophyll-a across that region between 2003 and 2024 with NASA and NOAA satellite products.',
      period: 'Observed period',
      temperature: 'Sea surface temperature',
      episode: 'El Niño 2015–2016',
      decade: 'per decade',
      temperatureMonths: 'months of temperature',
      chlorophyllMonths: 'months of chlorophyll-a',
      notSignificant: 'The full record shows no statistically significant trend.',
      episodeNote: 'Warmer water with {percent} % less chlorophyll-a than the same-month reference.',
      source: 'Values published by the observatory’s statistics engine.',
    },
    explore: 'Explore the ocean', marine: 'Meet the marine life',
    directory: 'Inside the observatory',
    back: 'Back to home', missing: 'Page not found', sources: 'Sources and methodology',
    sections: {
      home: { name: 'Home', description: '' },
      ocean: { name: 'Ocean Explorer', description: 'Satellite observations of the marine regions around Galápagos.' },
      trends: { name: 'Climate Detective', description: 'Time series and trends for studying how the ocean changes.' },
      species: { name: 'Marine Life', description: 'Five species and their relationship with conditions in the archipelago.' },
      signals: { name: 'Habitat Signals', description: 'Environmental indicators that give context to species habitats.' },
      timeline: { name: 'El Niño Timeline', description: 'Historical El Niño events and their seasonal reference periods.' },
      report: { name: 'Scientific Report', description: 'Scientific synthesis: questions, data, results and limits of the observatory.' },
    },
  },
}
