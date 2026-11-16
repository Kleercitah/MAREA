import type { LocalizedText, SpeciesId } from '../../data/contracts'
import { publicUrl } from '../../public-url'

/**
 * Contenido científico verificable de las cinco especies del observatorio.
 * Cada afirmación se clasifica por su origen (observación, interpretación,
 * estudio o hipótesis) y se apoya únicamente en las referencias listadas.
 */
export type EvidenceKind = 'observation' | 'ecology' | 'study' | 'hypothesis'

export interface SpeciesSection {
  key: 'habitat' | 'observation' | 'diet' | 'ecology' | 'physiology' | 'genetics' | 'sensitivity' | 'breeding' | 'nursing' | 'mechanism'
  kind: EvidenceKind
  title: LocalizedText
  body: LocalizedText
  citations: string[]
}

export interface SpeciesArticle {
  id: SpeciesId
  commonName: LocalizedText
  scientificName: SpeciesId
  taxonomy: { rank: 'class' | 'order' | 'family'; value: string }[]
  taxonomySource: string
  lead: LocalizedText
  sections: SpeciesSection[]
  citations: string[]
  illustrationPath: string
  photoPath: string
  photoCredit: string
  photoSource: string
  photoLicense: string
  photoLicenseUrl: string
  photoLocation: LocalizedText
}

const titles = {
  observation: { es: 'Qué miden los satélites aquí', en: 'What satellites measure here' },
  habitat: { es: 'Hábitat y distribución', en: 'Habitat and distribution' },
  diet: { es: 'Alimentación', en: 'Feeding' },
  ecology: { es: 'Relación con el océano', en: 'Relationship with the ocean' },
  physiology: { es: 'Fisiología y bioquímica', en: 'Physiology and biochemistry' },
  genetics: { es: 'Información genética', en: 'Genetic information' },
  sensitivity: { es: 'Sensibilidad documentada', en: 'Documented sensitivity' },
}

const art = (file: string) => publicUrl('/art/species/illustrations/' + file + '.png')
const photo = (file: string) => publicUrl('/art/species/photos/' + file + '.jpg')
const commonLicenseUrl = 'https://creativecommons.org/licenses/by-sa/4.0/deed.es'
const bySa3 = 'https://creativecommons.org/licenses/by-sa/3.0/deed.es'

const regionalScope = {
  es:'La SST y la clorofila-a de 2003–2024 describen el mar de Galápagos. Determinar la temperatura corporal, las presas de una inmersión o el éxito reproductivo requiere mediciones biológicas locales.',
  en:'SST and chlorophyll-a in 2003–2024 describe the Galápagos marine region. Body temperature, prey caught on a dive and breeding success require local biological measurements.',
}

export const speciesArticles: Record<SpeciesId, SpeciesArticle> = {
  'Spheniscus mendiculus': {
    id: 'Spheniscus mendiculus',
    commonName: { es: 'Pingüino de Galápagos', en: 'Galápagos penguin' },
    scientificName: 'Spheniscus mendiculus',
    taxonomy: [
      { rank: 'class', value: 'Aves' },
      { rank: 'order', value: 'Sphenisciformes' },
      { rank: 'family', value: 'Spheniscidae' },
    ],
    taxonomySource: 'https://www.marinespecies.org/aphia.php?p=taxlist&tName=Spheniscus%20mendiculus&tComp=1',
    lead: {
      es: 'Ave marina endémica del archipiélago y uno de los pingüinos que vive más al norte. Anida y descansa en costas rocosas y grietas de lava, y depende de aguas frías y productivas para encontrar su alimento.',
      en: 'A seabird endemic to the archipelago and one of the northernmost penguins. It nests and rests on rocky shores and lava crevices, and depends on cool, productive water to find food.',
    },
    sections: [
      {
        key: 'observation', kind: 'observation', title: titles.observation,
        body: {
          es: 'Las series de temperatura superficial y de clorofila-a describen el mar de la región que rodea Galápagos en promedios mensuales. No registran lo que ocurre en la colonia ni el alimento disponible frente a la costa: sirven como contexto del ambiente en el que vive la especie.',
          en: 'The sea surface temperature and chlorophyll-a series describe the sea around Galápagos as monthly averages. They do not record what happens at the colony or the food available off the coast: they are context for the environment this species lives in.',
        }, citations: [],
      },
      {
        key: 'habitat', kind: 'study', title: titles.habitat,
        body: {
          es: 'Se concentra en las islas occidentales, donde la surgencia mantiene el agua más fría, con núcleos menores en otras islas del archipiélago. Anida en grietas y túneles de lava cerca del mar y forrajea en aguas costeras someras, casi siempre a pocos kilómetros de la colonia.',
          en: 'It is concentrated on the western islands, where upwelling keeps the water cooler, with smaller groups on other islands of the archipelago. It nests in lava crevices and tunnels close to the sea and forages in shallow coastal water, usually within a few kilometres of the colony.',
        }, citations: ['boersma-1998', 'vargas-2006'],
      },
      {
        key: 'diet', kind: 'study', title: titles.diet,
        body: {
          es: 'Se alimenta de peces pequeños de cardumen que busca en aguas costeras. Durante los episodios cálidos los estudios describen cambios en el uso del espacio, dietas menos favorables y un descenso marcado del éxito reproductivo.',
          en: 'It feeds on small schooling fish taken in coastal water. During warm episodes, studies describe changes in space use, less favourable diets and a marked drop in breeding success.',
        }, citations: ['boersma-1998', 'vargas-2006'],
      },
      {
        key: 'ecology', kind: 'ecology', title: titles.ecology,
        body: {
          es: 'Como depredador de peces de cardumen, el pingüino depende, a través de varios niveles de la red trófica, de la producción planctónica que sostiene a esos peces. Una variación en la surgencia podría desplazar los cardúmenes accesibles. Esa cadena de relaciones es una interpretación ecológica: la clorofila-a satelital no mide el pez que el pingüino captura.',
          en: 'As a predator of schooling fish, the penguin depends, through several levels of the food web, on the plankton production that sustains those fish. Changes in upwelling could shift the fish schools within reach. This chain of relationships is an ecological interpretation: satellite chlorophyll-a does not measure the fish the penguin catches.',
        }, citations: ['boersma-1998'],
      },
      {
        key: 'physiology', kind: 'study', title: titles.physiology,
        body: {
          es: 'Las mediciones de peso indican mejor condición corporal en aguas superficiales frías y deterioro en episodios cálidos. Esa evidencia procede de aves examinadas en campo.',
          en: 'Weighing penguins in the field showed better body condition in cool surface waters and poorer condition during warm episodes.',
        }, citations: ['boersma-1998'],
      },
      {
        key: 'genetics', kind: 'study', title: titles.genetics,
        body: {
          es: 'La especie presenta una diversidad genética baja y una variación reducida en genes del sistema inmune (MHC), coherente con un tamaño poblacional pequeño y sostenido en el tiempo. Los análisis de su historia demográfica han evaluado además el papel de la selección natural en esa diversidad.',
          en: 'The species shows low genetic diversity and reduced variation in immune-system genes (MHC), consistent with a small and long-standing population size. Analyses of its demographic history have also assessed the role of natural selection in that diversity.',
        }, citations: ['bollmer-2007', 'arauco-shapiro-2020'],
      },
      {
        key: 'sensitivity', kind: 'study', title: titles.sensitivity,
        body: {
          es: 'Tras el episodio de 1982–1983 los censos registraron un descenso muy marcado de los individuos observados, y las series posteriores vinculan los episodios cálidos con caídas de la reproducción y de la supervivencia. Un análisis del Pacífico oriental ecuatorial sugiere que el enfriamiento de décadas recientes pudo haber favorecido a la especie, lo que añade incertidumbre sobre su futuro.',
          en: 'After the 1982–1983 episode, surveys recorded a sharp drop in the numbers counted, and subsequent series link warm episodes with declines in breeding and survival. An analysis of the eastern equatorial Pacific suggests that cooling in recent decades may have favoured the species, which adds uncertainty about its future.',
        }, citations: ['valle-1987-jgr', 'valle-1987-condor', 'boersma-1998', 'karnauskas-2015'],
      },
    ],
    citations: ['valle-1987-jgr', 'valle-1987-condor', 'boersma-1998', 'vargas-2006', 'karnauskas-2015', 'bollmer-2007', 'arauco-shapiro-2020', 'worms'],
    illustrationPath: art('spheniscus-mendiculus'),
    photoPath: photo('spheniscus-mendiculus'),
    photoCredit: 'Charles J. Sharp',
    photoSource: 'https://commons.wikimedia.org/wiki/File:Gal%C3%A1pagos_penguin_(Spheniscus_mendiculus)_male.jpg',
    photoLicense: 'CC BY-SA 3.0',
    photoLicenseUrl: bySa3,
    photoLocation: { es: 'Isabela, Galápagos (Punta Moreno)', en: 'Isabela, Galápagos (Punta Moreno)' },
  },

  'Amblyrhynchus cristatus': {
    id: 'Amblyrhynchus cristatus',
    commonName: { es: 'Iguana marina', en: 'Marine iguana' },
    scientificName: 'Amblyrhynchus cristatus',
    taxonomy: [
      { rank: 'class', value: 'Reptilia' },
      { rank: 'order', value: 'Squamata' },
      { rank: 'family', value: 'Iguanidae' },
    ],
    taxonomySource: 'https://www.marinespecies.org/aphia.php?p=taxlist&tName=Amblyrhynchus%20cristatus&tComp=1',
    lead: {
      es: 'Reptil endémico de Galápagos y el único lagarto marino del mundo. Pastorea algas en el fondo y en la orilla, y vuelve a las rocas negras a recuperar temperatura después de cada inmersión.',
      en: 'A reptile endemic to Galápagos and the only marine lizard in the world. It grazes algae on the seabed and the shore, and returns to black rocks to regain temperature after every dive.',
    },
    sections: [
      {
        key: 'observation', kind: 'observation', title: titles.observation,
        body: {
          es: 'La clorofila-a satelital mide el fitoplancton de la superficie del mar. La iguana marina come algas del fondo y de la franja intermareal, así que ese pigmento no mide su alimento y no debe equipararse a él. La SST describe las condiciones superficiales de toda la región; la temperatura de cada inmersión y la del animal requieren medición local.',
          en: 'Satellite chlorophyll-a measures phytoplankton in the surface ocean. The marine iguana eats algae from the seabed and the intertidal fringe, so that pigment does not measure its food and must not be equated with it. SST describes regional surface waters. Temperatures during individual dives and body temperatures require local measurements.',
        }, citations: [],
      },
      {
        key: 'habitat', kind: 'study', title: titles.habitat,
        body: {
          es: 'Ocupa la línea costera rocosa de casi todas las islas, con poblaciones que difieren en tamaño y color según la isla. Los individuos de las islas occidentales, con aguas más frías y productivas, alcanzan mayor tamaño que los del resto del archipiélago.',
          en: 'It occupies the rocky shoreline of almost every island, with populations that differ in size and colour from island to island. Individuals on the western islands, with cooler and more productive water, grow larger than those elsewhere in the archipelago.',
        }, citations: ['wikelski-1997'],
      },
      {
        key: 'diet', kind: 'study', title: titles.diet,
        body: {
          es: 'Es herbívora: pastorea algas rojas y verdes, tanto sumergida en el submareal somero como en la franja que queda al descubierto con la marea baja. La energía que obtiene de esas algas limita su tamaño corporal.',
          en: 'It is herbivorous: it grazes red and green algae, both underwater in the shallow subtidal and on the fringe exposed at low tide. The energy it obtains from those algae limits its body size.',
        }, citations: ['wikelski-1997'],
      },
      {
        key: 'ecology', kind: 'ecology', title: titles.ecology,
        body: {
          es: 'Su alimento son las algas bentónicas, no el plancton, de modo que su vínculo con las series satelitales del observatorio es indirecto. Lo que comparte con el resto del ecosistema es la dependencia de aguas frías y ricas en nutrientes, que sostienen tanto a la producción planctónica como a las comunidades de algas del litoral. Esa conexión es una interpretación ecológica y no una medida directa del alimento disponible.',
          en: 'Its food is benthic algae, not plankton, so its link with the observatory’s satellite series is indirect. What it shares with the rest of the ecosystem is a dependence on cool, nutrient-rich water, which sustains both plankton production and shoreline algal communities. That connection is an ecological interpretation, not a direct measurement of available food.',
        }, citations: ['wikelski-1997'],
      },
      {
        key: 'physiology', kind: 'study', title: titles.physiology,
        body: {
          es: 'Tiene una tasa metabólica baja para un lagarto de su tamaño y su temperatura corporal sigue a la del ambiente, por lo que depende de las rocas para calentarse tras bucear en agua fría. Durante El Niño se han medido respuestas concretas: los animales reducen su metabolismo, su longitud corporal se acorta y los niveles de corticosterona se relacionan con la probabilidad de sobrevivir.',
          en: 'It has a low metabolic rate for a lizard of its size and its body temperature follows the environment, so it depends on rocks to warm up after diving in cold water. During El Niño, specific responses have been measured: the animals lower their metabolism, their body length shrinks and corticosterone levels are related to survival probability.',
        }, citations: ['wikelski-thom-2000', 'romero-wikelski-2001', 'dubiner-2025'],
      },
      {
        key: 'genetics', kind: 'study', title: titles.genetics,
        body: {
          es: 'El estudio genético comparó muestras anteriores y posteriores a El Niño de 1997–1998. En la mayoría de las islas la diversidad neutral varió poco. En Marchena y Genovesa sí disminuyó la variación del ADN mitocondrial. En Marchena una erupción previa complica la atribución.',
          en: 'Genetic samples collected before and after the 1997–1998 El Niño showed little change in neutral diversity on most islands. Mitochondrial variation declined on Marchena and Genovesa. An earlier eruption complicates attribution on Marchena.',
        }, citations: ['steinfartz-2007', 'macleod-2015'],
      },
      {
        key: 'sensitivity', kind: 'study', title: titles.sensitivity,
        body: {
          es: 'Responde a la escasez de algas de los episodios cálidos con cambios medibles en metabolismo, tamaño corporal y supervivencia. Las poblaciones de las islas occidentales son las mejor estudiadas y no todas las islas reaccionan igual.',
          en: 'It responds to the algal scarcity of warm episodes with measurable changes in metabolism, body size and survival. Populations on the western islands are the best studied, and not every island responds in the same way.',
        }, citations: ['wikelski-thom-2000', 'romero-wikelski-2001', 'dubiner-2025'],
      },
    ],
    citations: ['laurie-brown-1990', 'laurie-1990-enso', 'vinueza-2006', 'wikelski-thom-2000', 'romero-wikelski-2001', 'wikelski-1997', 'steinfartz-2007', 'macleod-2015', 'dubiner-2025', 'worms'],
    illustrationPath: art('amblyrhynchus-cristatus'),
    photoPath: photo('amblyrhynchus-cristatus'),
    photoCredit: 'Sodacan',
    photoSource: 'https://commons.wikimedia.org/wiki/File:Marine_Iguana_(Amblyrhynchus_cristatus)_feeding_underwater_off_Fernandina_Island,_Gal%C3%A1pagos_Islands.jpg',
    photoLicense: 'CC BY-SA 4.0',
    photoLicenseUrl: commonLicenseUrl,
    photoLocation: { es: 'Fernandina, Galápagos (alimentándose bajo el agua)', en: 'Fernandina, Galápagos (feeding underwater)' },
  },

  'Zalophus wollebaeki': {
    id: 'Zalophus wollebaeki',
    commonName: { es: 'Lobo marino de Galápagos', en: 'Galápagos sea lion' },
    scientificName: 'Zalophus wollebaeki',
    taxonomy: [
      { rank: 'class', value: 'Mammalia' },
      { rank: 'order', value: 'Carnivora' },
      { rank: 'family', value: 'Otariidae' },
    ],
    taxonomySource: 'https://www.marinespecies.org/aphia.php?p=taxlist&tName=Zalophus%20wollebaeki&tComp=1',
    lead: {
      es: 'Pinnípedo endémico del archipiélago. Cría y descansa en playas y costas rocosas de casi todas las islas y forrajea en aguas costeras, en un ambiente de productividad variable.',
      en: 'A pinniped endemic to the archipelago. It breeds and rests on beaches and rocky shores on almost every island and forages in coastal water, in an environment of variable productivity.',
    },
    sections: [
      {
        key: 'observation', kind: 'observation', title: titles.observation,
        body: {
          es: 'La temperatura superficial y la clorofila-a del observatorio son promedios mensuales de una región amplia. Describen el ambiente en el que forrajea el lobo marino, no una inmersión concreta ni la presa que captura en un día determinado.',
          en: 'The observatory’s sea surface temperature and chlorophyll-a are monthly averages over a broad region. They describe the environment where the sea lion forages, not a particular dive or the prey it catches on a given day.',
        }, citations: [],
      },
      {
        key: 'habitat', kind: 'study', title: titles.habitat,
        body: {
          es: 'Se reproduce en colonias de playas y costas rocosas repartidas por el archipiélago. Las estimaciones de abundancia más completas se han realizado en el sureste, en islas como San Cristóbal, Santa Fe y Española, y la especie también está presente en el oeste.',
          en: 'It breeds in colonies on beaches and rocky shores across the archipelago. The most complete abundance estimates come from the southeast, on islands such as San Cristóbal, Santa Fe and Española, and the species is also present in the west.',
        }, citations: ['riofrio-lazo-2017'],
      },
      {
        key: 'diet', kind: 'study', title: titles.diet,
        body: {
          es: 'Se alimenta de peces y cefalópodos que captura en inmersiones. Sus requerimientos energéticos son bajos en comparación con otros otáridos, y su capacidad de almacenar oxígeno se ajusta al comportamiento de buceo y a la gestación.',
          en: 'It feeds on fish and cephalopods caught during dives. Its energy requirements are low compared with other otariids, and its oxygen storage capacity adjusts to diving behaviour and pregnancy.',
        }, citations: ['villegas-amtmann-2017', 'villegas-amtmann-costa-2010'],
      },
      {
        key: 'ecology', kind: 'ecology', title: titles.ecology,
        body: {
          es: 'Como depredador de peces y cefalópodos, su alimento depende de la producción planctónica de la región, mediada por la red trófica. Los estudios describen un gasto energético contenido y un comportamiento de forrajeo ajustado a un ambiente poco productivo e impredecible, lo que encaja con el contexto de surgencia de Galápagos. La relación entre los indicadores satelitales y su alimento es una interpretación, no una medición directa.',
          en: 'As a predator of fish and cephalopods, its food depends on the region’s plankton production through the food web. Studies describe contained energy expenditure and foraging behaviour adjusted to a low-productivity, unpredictable environment, which fits the upwelling context of Galápagos. The link between the satellite indicators and its food is an interpretation, not a direct measurement.',
        }, citations: ['villegas-amtmann-2017'],
      },
      {
        key: 'physiology', kind: 'study', title: titles.physiology,
        body: {
          es: 'Las mediciones de campo indican requerimientos energéticos bajos para un otárido de su tamaño, y la plasticidad de sus reservas de oxígeno acompaña a las fases de buceo intenso y de gestación.',
          en: 'Field measurements indicate low energy requirements for an otariid of its size, and the plasticity of its oxygen stores accompanies periods of intense diving and pregnancy.',
        }, citations: ['villegas-amtmann-2017', 'villegas-amtmann-costa-2010'],
      },
      {
        key: 'genetics', kind: 'study', title: titles.genetics,
        body: {
          es: 'Los análisis de marcadores genéticos y rasgos morfológicos muestran divergencia entre colonias del archipiélago, coherente con una dispersión limitada entre poblaciones.',
          en: 'Analyses of genetic markers and morphological traits show divergence among colonies in the archipelago, consistent with limited dispersal between populations.',
        }, citations: ['wolf-2008'],
      },
      {
        key: 'sensitivity', kind: 'study', title: titles.sensitivity,
        body: {
          es: 'Durante El Niño la disponibilidad de alimento cae y la especie responde con descensos de la supervivencia de crías y de la población. Los primeros efectos drásticos se documentaron en 1982–1983, y los recuentos de 2015 fueron inferiores a los de 2014, con recuperación parcial posterior.',
          en: 'During El Niño food availability falls and the species responds with declines in pup survival and population size. The first drastic effects were documented in 1982–1983, and the 2015 count was lower than the 2014 count, with partial recovery in later years.',
        }, citations: ['trillmich-limberger-1985', 'paez-rosas-2021'],
      },
    ],
    citations: ['fur-diet', 'trillmich-limberger-1985', 'paez-rosas-2021', 'riofrio-lazo-2017', 'wolf-2008', 'villegas-amtmann-2017', 'villegas-amtmann-costa-2010', 'worms'],
    illustrationPath: art('zalophus-wollebaeki'),
    photoPath: photo('zalophus-wollebaeki'),
    photoCredit: 'Diego Delso',
    photoSource: 'https://commons.wikimedia.org/wiki/File:Lobo_marino_(Zalophus_californianus_wollebaeki),_Punta_Pitt,_isla_de_San_Crist%C3%B3bal,_islas_Gal%C3%A1pagos,_Ecuador,_2015-07-24,_DD_12.JPG',
    photoLicense: 'CC BY-SA 4.0',
    photoLicenseUrl: commonLicenseUrl,
    photoLocation: { es: 'San Cristóbal, Galápagos (Punta Pitt)', en: 'San Cristóbal, Galápagos (Punta Pitt)' },
  },

  'Nannopterum harrisi': {
    id: 'Nannopterum harrisi',
    scientificName: 'Nannopterum harrisi',
    commonName: { es: 'Cormorán no volador', en: 'Flightless cormorant' },
    taxonomy: [{rank:'class',value:'Aves'}, {rank:'order',value:'Suliformes'}, {rank:'family',value:'Phalacrocoracidae'}],
    taxonomySource: 'https://www.marinespecies.org/aphia.php?p=taxlist&tName=Nannopterum%20harrisi',
    lead: {es:'Ave buceadora endémica de Isabela y Fernandina. Tiene alas cortas y se desplaza nadando entre la costa de lava y sus zonas de alimentación.',
      en:'A diving bird endemic to Isabela and Fernandina. Its short wings preclude flight and it swims between lava shores and feeding grounds.'},
    sections: [
      {key:'habitat',kind:'study',title:titles.habitat,
        body:{es:'Anida en el litoral occidental de Galápagos. En una colonia seguida durante diez años, muchas aves permanecieron en tramos costeros de unos cientos de metros.',
          en:'It nests on the western Galápagos coastline. At a colony monitored for ten years, many birds stayed within stretches of shore a few hundred metres long.'},citations:['tindle-2013']},
      {key:'diet',kind:'study',title:titles.diet,
        body:{es:'Bucea para capturar peces y otras presas del fondo en aguas próximas a la costa.',
          en:'It dives for fish and other bottom-dwelling prey in nearshore waters.'},citations:['tindle-2013']},
      {key:'breeding',kind:'study',title:{es:'Cuidado parental',en:'Parental care'},
        body:{es:'En la colonia estudiada, los machos dedicaron más esfuerzo que las hembras a construir el nido y alimentar a las crías.',
          en:'In the study colony, males contributed more than females to building nests and feeding offspring.'},citations:['tindle-2013']},
      {key:'mechanism',kind:'hypothesis',title:titles.ecology,
        body:{es:'La surgencia podría acercar presas a las zonas de buceo. Para comprobar el mecanismo en una colonia hacen falta observaciones locales de presas y alimentación.',
          en:'Upwelling may bring prey into diving areas. Testing that mechanism at a colony requires local prey and feeding observations.'},citations:['tindle-2013']},
      {key:'observation',kind:'observation',title:titles.observation,body:regionalScope,citations:[]},
    ],
    citations:['valle-1987-condor','valle-1987-jgr','tindle-2013','worms'],
    illustrationPath:art('nannopterum-harrisi'),photoPath:photo('nannopterum-harrisi'),
    photoCredit:'Dan',photoLicense:'CC BY-SA 2.0',photoLicenseUrl:'https://creativecommons.org/licenses/by-sa/2.0/',
    photoSource:'https://commons.wikimedia.org/wiki/File:Flightless_Cormorant_on_Fernandina_Island.jpg',
    photoLocation:{es:'Fernandina, Galápagos',en:'Fernandina, Galápagos'},
  },
  'Arctocephalus galapagoensis': {
    id:'Arctocephalus galapagoensis',scientificName:'Arctocephalus galapagoensis',
    commonName:{es:'Lobo peletero de Galápagos',en:'Galápagos fur seal'},
    taxonomy:[{rank:'class',value:'Mammalia'},{rank:'order',value:'Carnivora'},{rank:'family',value:'Otariidae'}],
    taxonomySource:'https://www.marinespecies.org/aphia.php?p=taxlist&tName=Arctocephalus%20galapagoensis',
    lead:{es:'Otárido endémico de Galápagos. Utiliza costas rocosas para descansar y criar y sale al mar en busca de peces y calamares.',
      en:'A fur seal endemic to Galápagos. It rests and raises pups on rocky coasts and forages at sea for fish and squid.'},
    sections:[
      {key:'habitat',kind:'study',title:titles.habitat,
        body:{es:'La mayor concentración de colonias se encuentra en las islas occidentales y septentrionales. Fernandina es un núcleo importante de reproducción.',
          en:'Breeding colonies are concentrated on the western and northern islands. Fernandina is a major breeding site.'},citations:['paez-rosas-2021']},
      {key:'diet',kind:'study',title:titles.diet,
        body:{es:'La dieta incluye peces y cefalópodos. La clorofila superficial registra un pigmento del fitoplancton, varios pasos antes de estas presas en la red alimentaria.',
          en:'The diet includes fish and cephalopods. Surface chlorophyll records a phytoplankton pigment several steps removed from these prey in the food web.'},citations:['fur-diet','trillmich-limberger-1985']},
      {key:'nursing',kind:'study',title:{es:'Lactancia y alimentación',en:'Nursing and foraging'},
        body:{es:'Las crías dependen de las visitas de alimentación de sus madres. En 1982–1983 se documentaron fallos reproductivos y pérdidas importantes entre las clases de edad dependientes.',
          en:'Pups depend on nursing visits from their mothers. Field studies in 1982–1983 recorded reproductive failure and losses among dependent age classes.'},citations:['trillmich-limberger-1985']},
      {key:'mechanism',kind:'hypothesis',title:titles.ecology,
        body:{es:'Si las presas se vuelven menos accesibles, las madres podrían tardar más en regresar a tierra. Comprobarlo en un mes concreto requiere seguir a las hembras y sus crías.',
          en:'If prey become harder to reach, mothers may take longer to return ashore. Testing this for a particular month requires tracking females and their pups.'},citations:['trillmich-limberger-1985']},
      {key:'observation',kind:'observation',title:titles.observation,body:regionalScope,citations:[]},
    ],
    citations:['paez-rosas-2021','trillmich-limberger-1985','fur-diet','worms'],
    illustrationPath:art('arctocephalus-galapagoensis'),photoPath:photo('arctocephalus-galapagoensis'),
    photoCredit:'D. Gordon E. Robertson',photoLicense:'CC BY-SA 3.0',photoLicenseUrl:bySa3,
    photoSource:'https://commons.wikimedia.org/wiki/File:Galapagos_Fur_Seal,_Santiago_Island.jpg',
    photoLocation:{es:'Santiago, Galápagos',en:'Santiago, Galápagos'},
  },
}

export const speciesOrder: SpeciesId[] = [
  'Spheniscus mendiculus',
  'Amblyrhynchus cristatus',
  'Zalophus wollebaeki',
  'Nannopterum harrisi',
  'Arctocephalus galapagoensis',
]

export function isSpecies(value: string | null): value is SpeciesId {
  return value !== null && Object.hasOwn(speciesArticles, value)
}
