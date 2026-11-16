import type { LocalizedText, SpeciesId } from '../../data/contracts'
import { biologicalEvidence } from '../species/evidence'
import { fieldStories } from '../species/fieldStories'
import { combination, type RegionalMonth } from './regionalMonth'
import { signalLabels, type SignalFocus } from './labels'

const copy = (es: string, en: string): LocalizedText => ({ es, en })

interface EcologyRule {
  focus: SignalFocus
  warm: LocalizedText
  cool: LocalizedText
  high: LocalizedText
  low: LocalizedText
  near: LocalizedText
  citations: string[]
}

export const speciesReadings: Record<SpeciesId, EcologyRule> = {
  'Spheniscus mendiculus': {
    focus: 'both',
    warm: copy('El agua más cálida plantea una pregunta sobre la distancia que recorren los adultos hasta los cardúmenes durante la crianza.', 'Warmer water raises a question about how far adults must travel to find schooling fish when provisioning chicks.'),
    cool: copy('El agua más fría es compatible con el ambiente de afloramiento que utilizan los pingüinos occidentales. Localizar los cardúmenes exige muestrear la costa.', 'Cooler water is consistent with the western upwelling habitat penguins use. Finding the fish schools requires coastal surveys.'),
    high: copy('El pigmento superficial por encima de la referencia señala un cambio en la base planctónica de la red que sostiene a los peces pequeños.', 'Above-reference surface pigment marks a change at the planktonic base of the food web supporting small fish.'),
    low: copy('Con menos pigmento superficial, interesa comprobar si la distribución de los peces cambia antes de relacionarla con alimentación o reclutamiento.', 'With less surface pigment, changes in fish distribution would need to be measured before drawing a link to feeding or recruitment.'),
    near: copy('Con ambas señales dentro de su variación mensual habitual, la pregunta para la colonia sigue siendo si los cardúmenes están al alcance de los adultos que alimentan crías.', 'With both signals within their usual monthly variation, the question for the colony is whether schooling fish are within reach of adults feeding chicks.'),
    citations: ['boersma-1998','valle-1987-condor'],
  },
  'Amblyrhynchus cristatus': {
    focus: 'temperature',
    warm: copy('En una superficie más cálida, el contraste relevante para esta herbívora es si cambia la composición del pasto adherido a la roca, como ocurrió en Santa Fe.', 'With warmer surface water, the relevant question for this grazer is whether the composition of algal turf changes, as observed on Santa Fe.'),
    cool: copy('La superficie más fría ofrece contexto para comparar costas expuestas al afloramiento. La alimentación depende de qué algas crecen en las rocas accesibles.', 'Cooler surface water gives context for comparing shores exposed to upwelling. Feeding depends on which algae grow on accessible rocks.'),
    high: copy('El aumento de clorofila corresponde al fitoplancton de la columna de agua. Un aumento del pasto bentónico requeriría observación intermareal.', 'Higher chlorophyll refers to phytoplankton in the water column. An increase in benthic forage would require intertidal observations.'),
    low: copy('El descenso del pigmento superficial deja abierta la disponibilidad de algas bentónicas. La dieta y condición corporal se comprueban en el litoral.', 'Lower surface pigment leaves the availability of benthic algae unresolved. Diet and body condition must be checked along the shore.'),
    near: copy('Una región cercana a su referencia aún puede contener costas con distinta composición de algas. Para evaluar el alimento de la iguana se necesitan parcelas intermareales.', 'Even when regional conditions are near their reference, shores can differ in algal composition. Intertidal plots are needed to assess iguana forage.'),
    citations: ['laurie-brown-1990','laurie-1990-enso','vinueza-2006'],
  },
  'Zalophus wollebaeki': {
    focus: 'both',
    warm: copy('Con una superficie más cálida, interesa localizar peces y cefalópodos en las zonas que visitan las madres entre tomas de leche.', 'With warmer surface water, fish and squid surveys would help locate prey where mothers forage between nursing visits.'),
    cool: copy('Una superficie más fría permite contrastar zonas de forrajeo costero y preguntar si las presas quedan al alcance de las hembras lactantes.', 'Cooler surface water gives a basis for comparing coastal foraging grounds and testing whether prey are within reach of nursing females.'),
    high: copy('Más pigmento caracteriza la base de la red alimentaria. Para vincularlo con el aprovisionamiento de las crías hacen falta datos de los peces consumidos.', 'More pigment describes the base of the food web. Linking it to pup provisioning requires data on the fish eaten.'),
    low: copy('Menos clorofila invita a contrastar la distribución de las presas con la asistencia de madres a las colonias. El censo cuenta animales presentes en tierra.', 'Lower chlorophyll invites comparison of prey distribution with maternal attendance. Colony surveys count animals present ashore.'),
    near: copy('Con ambas variables cerca de la referencia, los recuentos de una colonia aún dependen de cuántas madres están en el mar. La supervivencia de las crías exige seguimiento individual.', 'With both variables near their reference, counts at a colony still depend on how many mothers are at sea. Pup survival requires individual monitoring.'),
    citations: ['fur-diet','paez-rosas-2021','trillmich-limberger-1985'],
  },
  'Nannopterum harrisi': {
    focus: 'both',
    warm: copy('Un mes más cálido contrasta con la persistencia de aguas frías asociada a más puestas en Punta Espinosa. Para evaluar esa persistencia hay que seguir varios meses cerca de la colonia.', 'A warmer month contrasts with the persistent cool water associated with more clutches at Punta Espinosa. Persistence requires observations over several months near the colony.'),
    cool: copy('El agua más fría coincide en dirección con las condiciones asociadas a más puestas y juveniles en Punta Espinosa. Un solo mes regional deja por comprobar la persistencia local.', 'Cooler water is consistent with conditions associated with more clutches and fledglings at Punta Espinosa. A single regional month leaves local persistence unresolved.'),
    high: copy('El pigmento elevado describe la superficie. Harían falta censos de peces junto al fondo para evaluar el alimento disponible durante los buceos.', 'Elevated pigment describes the surface. Fish surveys near the seabed would be needed to assess food on dives.'),
    low: copy('Con pigmento por debajo de la referencia, la pregunta es si también cambia el alimento cerca del fondo en los tramos de costa usados para criar.', 'With pigment below the reference, the question is whether food near the seabed also changes along breeding shores.'),
    near: copy('Una media regional habitual aporta poca información sobre la persistencia de aguas frías en el pequeño tramo de costa donde un cormorán bucea y cría.', 'A typical regional mean says little about the persistence of cool water along the short stretch of coast where a cormorant dives and breeds.'),
    citations: ['tindle-2013','valle-1987-condor'],
  },
  'Arctocephalus galapagoensis': {
    focus: 'both',
    warm: copy('La superficie más cálida plantea si las presas mesopelágicas siguen siendo accesibles de noche a las madres. Resolverlo requiere perfiles de profundidad.', 'Warmer surface water raises the question of whether midwater prey remain accessible to mothers at night. Testing it requires depth profiles.'),
    cool: copy('Con la superficie más fría, interesa comparar la posición nocturna de peces y calamares con las profundidades que alcanzan las hembras.', 'With cooler surface water, the relevant comparison is between the night-time depth of fish and squid and the depths reached by females.'),
    high: copy('El mayor pigmento está varios pasos tróficos por debajo de sus presas. Es necesario seguir a las madres para conocer el intervalo entre tomas.', 'Higher pigment is several trophic steps removed from its prey. Monitoring mothers is necessary to establish intervals between nursing visits.'),
    low: copy('Una concentración menor de pigmento motiva examinar las presas pelágicas y mesopelágicas. La duración de viajes y la condición de las crías se miden por separado.', 'Lower pigment motivates sampling pelagic and midwater prey. Trip duration and pup condition are measured separately.'),
    near: copy('Aun con condiciones superficiales habituales, los peces migran verticalmente de noche. La accesibilidad a profundidad y el retorno de las madres requieren seguimiento.', 'Even under typical surface conditions, fish migrate vertically at night. Prey accessibility at depth and mothers’ returns require monitoring.'),
    citations: ['fur-diet','paez-rosas-2021','trillmich-limberger-1985'],
  },
}

const cycleContext = {
  'el-nino': copy('El ONI documenta una fase cálida en el Pacífico ecuatorial central. Su expresión en Galápagos se contrasta con las anomalías regionales disponibles.', 'ONI documents a warm phase in the central equatorial Pacific. Available regional anomalies show how conditions in Galápagos compare.'),
  'la-nina': copy('El ONI documenta una fase fría en el Pacífico ecuatorial central. Comprobar cuánto dura el enfriamiento cerca de una colonia requiere varios meses de observaciones locales.', 'ONI documents a cool phase in the central equatorial Pacific. Testing how long cooling persists near a colony requires several months of local observations.'),
  outside: copy('La cronología ONI no incluye este mes en un episodio. La señal regional puede diferir de la del Pacífico ecuatorial central.', 'The ONI chronology assigns this month to no episode. Regional conditions can differ from the central equatorial Pacific.'),
  unavailable: copy('Falta el contexto ONI de este mes.', 'ONI context is unavailable for this month.'),
}

export function interpretMonth(id: SpeciesId, record: RegionalMonth, language: keyof LocalizedText) {
  const es = language === 'es'
  const labels = signalLabels[language]
  const rule = speciesReadings[id]
  const story = fieldStories[id]
  const evidence = biologicalEvidence[id]
  const combo = combination(record)
  const signals: string[] = []
  for (const [item, high, low] of [[record.sst, rule.warm, rule.cool], [record.chlorophyll, rule.high, rule.low]] as const) {
    if (item.missing || item.anomaly == null) {
      const name = item.variable === 'sst' ? 'SST' : (es ? 'clorofila-a' : 'chlorophyll-a')
      if (item.quality === 'insufficient') {
        signals.push(es ? 'La cobertura de ' + name + ' es insuficiente para una media regional.' : name + ' coverage is insufficient for a regional mean.')
        continue
      }
      signals.push(es ? 'Sin comparación válida de ' + name + ' para este mes.' : 'No valid ' + name + ' comparison this month.')
    } else if (item.category === 'moderate' || item.category === 'large') {
      // Solo se afirma una dirección cuando la variable supera su variación
      // mensual habitual; una anomalía pequeña queda descrita como referencia.
      signals.push((item.anomaly > 0 ? high : low)[language])
    }
  }
  const near = record.sst.category === 'near' && record.chlorophyll.category === 'near'
  const direction = (value: number | null, name: string) => {
    if (value == null) return name + (es ? ' sin comparación' : ' unavailable for comparison')
    if (value === 0) return name + (es ? ' en la referencia' : ' at the reference')
    return name + (value > 0 ? (es ? ' por encima' : ' above reference') : (es ? ' por debajo' : ' below reference'))
  }
  const directions = [direction(record.sst.anomaly, 'SST'), direction(record.chlorophyll.anomaly, es ? 'clorofila-a' : 'chlorophyll-a')].join(' · ')
  const phaseText = {
    'el-nino': 'El Niño', 'la-nina': 'La Niña',
    outside: es ? 'Fuera de los episodios catalogados' : 'Outside catalogued episodes',
    unavailable: es ? 'Registro ONI no disponible' : 'ONI record unavailable',
  }[record.phase]
  const coincidesWithSurvey = record.phase === 'el-nino' && record.month.startsWith('2015') &&
    (id === 'Zalophus wollebaeki' || id === 'Arctocephalus galapagoensis')
  const context = coincidesWithSurvey
    ? copy('Este mes coincide con el año del descenso censado en las colonias. El recuento anual y el promedio mensual tienen escalas distintas.', 'This month falls in the year of the observed colony decline. Annual counts and monthly ocean averages have different time scales.')
    : cycleContext[record.phase]
  return {
    month: record.month, phaseText, context: context[language],
    observations: [record.sst, record.chlorophyll],
    conditions: near ? labels.combinations.mixed + '. ' + directions : combo ? labels.combinations[combo] : directions,
    ecology: near ? rule.near[language] : signals.join(' ') || rule.near[language],
    mechanism: story.response.text[language], historical: evidence.observed[language], period: evidence.period,
    ecosystem: evidence.ecosystem[language], uncertainty: story.missing[language],
    references: [...new Set([...rule.citations, story.response.source, evidence.source, evidence.ecosystemSource])],
  }
}
