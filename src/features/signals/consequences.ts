import type { LocalizedText, SpeciesId } from '../../data/contracts'

const copy = (es: string, en: string): LocalizedText => ({ es, en })

/**
 * Nivel de respaldo de cada consecuencia ecosistémica.
 * La interfaz debe hacer comprensible esta distinción:
 * — demonstrated: efectos observados y publicados.
 * — mechanism: relación ecológica conocida, sin evidencia de toda la cadena para el episodio.
 * — research: posible consecuencia aún no medida.
 */
export type ConsequenceKind = 'demonstrated' | 'mechanism' | 'research'

export interface Consequence {
  text: LocalizedText
  citations: string[]
}

export const consequenceKinds: ConsequenceKind[] = ['demonstrated', 'mechanism', 'research']

export const consequences: Record<SpeciesId, Record<ConsequenceKind, Consequence[]>> = {
  'Spheniscus mendiculus': {
    demonstrated: [
      {
        text: copy(
          'En las costas censadas de Isabela y Fernandina se contaron 1716 pingüinos en 1980 y 398 en 1983, un descenso del 77 %. Los censos registran aves presentes, no el destino de cada individuo.',
          'Surveys along Isabela and Fernandina counted 1,716 penguins in 1980 and 398 in 1983, a 77% decline. Surveys record birds present, not the fate of each individual.',
        ),
        citations: ['valle-1987-condor'],
      },
      {
        text: copy(
          'Tras el episodio cálido, los censos registraron escaso reclutamiento de juveniles, lo que limitó la recuperación de la población observada.',
          'After the warm episode, surveys documented low juvenile recruitment, which constrained the recovery of the observed population.',
        ),
        citations: ['valle-1987-condor', 'boersma-1998'],
      },
    ],
    mechanism: [
      {
        text: copy(
          'La dependencia de peces de cardumen liga al ave al afloramiento: si la presa se aleja de la colonia, la crianza se resiente. La cadena alimento–distancia–éxito reproductivo no se ha medido de forma simultánea.',
          'Its dependence on schooling fish ties the bird to upwelling: if prey move away from the colony, breeding suffers. The food–distance–breeding-success chain has not been measured simultaneously.',
        ),
        citations: ['boersma-1998', 'vargas-2006'],
      },
      {
        text: copy(
          'Como consumidor de peces pequeños, comparte el recurso con otras aves marinas y con peces depredadores de la misma red costera.',
          'As a consumer of small fish, it shares the resource with other seabirds and with predatory fish in the same coastal web.',
        ),
        citations: ['vargas-2006'],
      },
    ],
    research: [
      {
        text: copy(
          'No se ha medido cómo respondería la población de presas a la reducción del pingüino, ni si el ave solo sigue a los peces o influye en ellos.',
          'It has not been measured how prey populations would respond to the penguin’s decline, nor whether the bird merely follows the fish or influences them.',
        ),
        citations: ['vargas-2006'],
      },
      {
        text: copy(
          'Cuánto limita realmente el alimento a la crianza en las colonias actuales es una consecuencia por investigar.',
          'How much food actually limits breeding in today’s colonies is a consequence still to be investigated.',
        ),
        citations: ['boersma-1998'],
      },
    ],
  },
  'Amblyrhynchus cristatus': {
    demonstrated: [
      {
        text: copy(
          'En Santa Fe, el seguimiento por marcaje y recaptura estimó una mortalidad por inanición del 60–70 % durante El Niño; las pérdidas fueron especialmente intensas entre machos adultos y juveniles.',
          'On Santa Fe, mark–recapture monitoring estimated 60–70% starvation mortality during El Niño; losses were especially heavy among adult males and juveniles.',
        ),
        citations: ['laurie-brown-1990', 'laurie-1990-enso'],
      },
      {
        text: copy(
          'Muchas de las algas preferidas desaparecieron y se extendió el alga parda Giffordia mitchelliae; casi toda la cohorte nacida en 1982 se perdió y la reproducción se interrumpió la temporada siguiente.',
          'Many preferred algae disappeared and the brown alga Giffordia mitchelliae spread; nearly the entire 1982 hatchling cohort was lost and breeding stopped the following season.',
        ),
        citations: ['laurie-1990-enso'],
      },
      {
        text: copy(
          'En el experimento de exclusión en dos costas de Santa Cruz, los herbívoros influyeron en el tamaño de las algas en el pico de El Niño 1997–1998; después del episodio, en un sitio solo la acción conjunta de los herbívoros redujo las algas erectas.',
          'In the exclusion experiment on two Santa Cruz shores, grazers influenced algal size at the peak of the 1997–1998 El Niño; after the event, at one site only all grazers acting together reduced erect algae.',
        ),
        citations: ['vinueza-2006'],
      },
    ],
    mechanism: [
      {
        text: copy(
          'La herbivoría controla la comunidad rocosa, pero de forma compartida con cangrejos y peces herbívoros: el experimento no atribuye la respuesta de las algas a la iguana por sí sola.',
          'Herbivory controls the rocky community, but in a way shared with crabs and herbivorous fish: the experiment does not attribute the algal response to iguanas alone.',
        ),
        citations: ['vinueza-2006'],
      },
      {
        text: copy(
          'Al final de El Niño de 1998, las concentraciones de corticosterona medidas en campo se relacionaron con la condición corporal y predijeron diferencias de supervivencia entre poblaciones.',
          'At the end of the 1998 El Niño, field-measured corticosterone concentrations tracked body condition and predicted differences in survival among populations.',
        ),
        citations: ['romero-wikelski-2001'],
      },
    ],
    research: [
      {
        text: copy(
          'No se ha medido si una reducción prolongada de iguanas cambiaría la comunidad algal de forma duradera en una costa concreta.',
          'It has not been measured whether a prolonged reduction in iguanas would durably change the algal community on a given shore.',
        ),
        citations: ['vinueza-2006'],
      },
      {
        text: copy(
          'Las mediciones de MAREA y la nutrición de la iguana solo podrían contrastarse con parcelas intermareales, identificación de algas y seguimiento de condición corporal en las mismas fechas.',
          'MAREA measurements and iguana nutrition could only be linked with intertidal plots, algal identification and body-condition records on matching dates.',
        ),
        citations: ['vinueza-2006', 'romero-wikelski-2001'],
      },
    ],
  },
  'Zalophus wollebaeki': {
    demonstrated: [
      {
        text: copy(
          'En 32 colonias reproductivas de 13 islas, el número de lobos marinos contados en 2015 disminuyó un 23,9 % respecto a 2014, y el recuento específico de crías cayó un 40,5 %.',
          'Across 32 breeding colonies on 13 islands, sea lion counts in 2015 fell 23.9% relative to 2014, and the pup-specific count fell 40.5%.',
        ),
        citations: ['paez-rosas-2021'],
      },
      {
        text: copy(
          'En Santa Fe, en 1983, solo 19 de 140 crías siguieron vivas a los cinco meses; se observó abandono, desnutrición e inanición.',
          'On Santa Fe in 1983 only 19 of 140 pups survived their first five months; abandonment, undernutrition and starvation were observed.',
        ),
        citations: ['trillmich-limberger-1985'],
      },
    ],
    mechanism: [
      {
        text: copy(
          'La lactancia obliga a las madres a alternar mar y tierra: si las presas se alejan, los intervalos entre visitas se alargan y las crías pasan más tiempo sin comer.',
          'Nursing forces mothers to alternate sea and shore: if prey move away, the intervals between visits lengthen and pups go longer without food.',
        ),
        citations: ['trillmich-limberger-1985'],
      },
      {
        text: copy(
          'Los otolitos de sardinas predominan en las muestras de heces del lobo marino, lo que lo vincula a presas costeras; esto describe lo consumido en los sitios de muestreo.',
          'Sardine ear bones predominate in the sea lion’s scat samples, linking it to coastal prey; this describes what was eaten at the sampling sites.',
        ),
        citations: ['fur-diet'],
      },
    ],
    research: [
      {
        text: copy(
          'No se ha medido si el lobo marino controla la abundancia de sus presas o si solo responde a ella.',
          'It has not been measured whether the sea lion controls prey abundance or simply responds to it.',
        ),
        citations: ['trillmich-limberger-1985'],
      },
      {
        text: copy(
          'Los censos no separan mortalidad de cambios de asistencia a las colonias; atribuir el descenso a la alimentación exige observaciones simultáneas de presas, asistencia materna y supervivencia.',
          'Counts do not separate mortality from changes in colony attendance; attributing the decline to feeding requires concurrent observations of prey, maternal attendance and survival.',
        ),
        citations: ['paez-rosas-2021'],
      },
    ],
  },
  'Nannopterum harrisi': {
    demonstrated: [
      {
        text: copy(
          'En las costas de Isabela y Fernandina se contaron 802 cormoranes en 1980 y 409 en 1983, un descenso del 49 %. El censo registró aves presentes, no el destino de cada adulto.',
          'Along the coasts of Isabela and Fernandina, 802 cormorants were counted in 1980 and 409 in 1983, a 49% decline. The survey recorded birds present, not the fate of each adult.',
        ),
        citations: ['valle-1987-condor'],
      },
      {
        text: copy(
          'En 1984 se contaron 637 aves en enero y 869 en agosto–septiembre, por encima de la referencia de 802 de 1980: la especie se recuperó antes que otras de la misma costa.',
          'In 1984, 637 birds were counted in January and 869 in August–September, above the 1980 baseline of 802: the species recovered sooner than others on the same coast.',
        ),
        citations: ['valle-1987-condor'],
      },
    ],
    mechanism: [
      {
        text: copy(
          'En una colonia de Punta Espinosa seguida diez años, la persistencia de aguas frías se asoció con más puestas y más juveniles criados; los autores propusieron la disponibilidad de presas como explicación.',
          'In a Punta Espinosa colony monitored for ten years, persistent cool water was associated with more clutches and more fledglings; the authors proposed prey availability as the explanation.',
        ),
        citations: ['tindle-2013'],
      },
      {
        text: copy(
          'Su distribución se limita a Isabela y Fernandina, por lo que depende de presas cercanas al fondo en un número reducido de tramos de costa.',
          'Its range is limited to Isabela and Fernandina, so it depends on bottom prey along a small number of stretches of coast.',
        ),
        citations: ['tindle-2013', 'valle-1987-condor'],
      },
    ],
    research: [
      {
        text: copy(
          'El estudio no cuantificó una cascada sobre el fondo marino; relacionar la superficie con el éxito de un nido exige localizar inmersiones y muestrear peces de fondo.',
          'The study did not quantify a cascade on the seabed; linking the surface to nest success requires locating dives and surveying bottom fish.',
        ),
        citations: ['tindle-2013'],
      },
      {
        text: copy(
          'Cómo responderían las comunidades marinas locales si la especie desapareciera de un tramo de costa es una consecuencia por investigar.',
          'How local marine communities would respond if the species disappeared from a stretch of coast is a consequence still to be investigated.',
        ),
        citations: ['tindle-2013'],
      },
    ],
  },
  'Arctocephalus galapagoensis': {
    demonstrated: [
      {
        text: copy(
          'En Cabo Hammond, la mediana de los viajes de alimentación pasó de 1,3 días en 1979–1980 a 3,5 en 1982, y ninguna de las 18 crías seguidas a finales de 1982 sobrevivió sus primeros cinco meses.',
          'At Cabo Hammond the median feeding trip rose from 1.3 days in 1979–1980 to 3.5 in 1982, and none of the 18 pups followed in late 1982 survived their first five months.',
        ),
        citations: ['trillmich-limberger-1985'],
      },
      {
        text: copy(
          'En 11 colonias de siete islas, los recuentos cayeron un 38,1 % de 2014 a 2015; las crías descendieron un 36,8 % y se recuperaron un 86,8 % al año siguiente.',
          'Across 11 colonies on seven islands, counts fell 38.1% from 2014 to 2015; pup counts fell 36.8% and recovered 86.8% the following year.',
        ),
        citations: ['paez-rosas-2021'],
      },
    ],
    mechanism: [
      {
        text: copy(
          'Sus presas incluyen peces mesopelágicos que ascienden de noche; el acceso depende de la profundidad y el momento en que estén al alcance, no solo de las condiciones superficiales.',
          'Its prey include midwater fish that rise at night; access depends on depth and timing rather than on surface conditions alone.',
        ),
        citations: ['fur-diet'],
      },
      {
        text: copy(
          'El uso de la columna de agua difiere del lobo marino: en las heces del peletero predominan peces linterna, mientras en el lobo marino predominan las sardinas costeras.',
          'Its use of the water column differs from the sea lion: lanternfish predominate in fur seal scats, whereas coastal sardines predominate in sea lion samples.',
        ),
        citations: ['fur-diet'],
      },
    ],
    research: [
      {
        text: copy(
          'La densidad de presas en cada inmersión no se ha medido; harían falta perfiles de presas nocturnas, registros de buceo y medidas de lactancia.',
          'Prey density on individual dives has not been measured; nocturnal prey profiles, dive records and nursing measurements would be needed.',
        ),
        citations: ['trillmich-limberger-1985'],
      },
      {
        text: copy(
          'Cómo afectaría una caída de la población del peletero a las presas mesopelágicas que consume es una consecuencia por investigar.',
          'How a decline in the fur seal population would affect the midwater prey it consumes is a consequence still to be investigated.',
        ),
        citations: ['fur-diet', 'paez-rosas-2021'],
      },
    ],
  },
}
