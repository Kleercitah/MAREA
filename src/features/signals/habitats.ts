import type { LocalizedText, SpeciesId } from '../../data/contracts'
import { publicUrl } from '../../public-url'

/**
 * Galerías de ambientes y contexto de hábitat por especie para Habitat Signals.
 * Cada fotografía procede de Wikimedia Commons, con autor, licencia y página de
 * origen verificables. Las imágenes que no son de Galápagos se marcan como tales
 * y se reutilizan únicamente porque ilustran el tipo de ambiente de la especie.
 */
export interface HabitatImage {
  src: string
  caption: LocalizedText
  location: LocalizedText
  credit: string
  license: string
  licenseUrl: string
  source: string
  galapagos: boolean
}

export interface HabitatProfile {
  /** Ambiente que utiliza la especie, según los estudios citados en su ficha. */
  habitat: LocalizedText
  /** Tipo de alimentación. */
  feeding: LocalizedText
  /** Relación explícita con la temperatura superficial regional. */
  sstRelation: LocalizedText
  /** Relación explícita con la clorofila-a regional, sin sobreextender la evidencia. */
  chlorophyllRelation: LocalizedText
  /** Sensibilidad ecológica documentada. */
  sensitivity: LocalizedText
  /** Explicación fisiológica pertinente. */
  physiology?: LocalizedText
  images: HabitatImage[]
}

const image = (
  file: string, galapagos: boolean, credit: string, license: string, licenseUrl: string, source: string,
  caption: LocalizedText, location: LocalizedText,
): HabitatImage => ({ src: publicUrl('/art/habitats/' + file + '.jpg'), galapagos, credit, license, licenseUrl, source, caption, location })

const regionalSST = {
  es: 'La media regional caracteriza la superficie del océano. La temperatura corporal y el ambiente de cada inmersión requieren mediciones locales.',
  en: 'The regional mean describes the ocean surface. Body temperature and the conditions on an individual dive require local measurements.',
}

const bySa2 = 'https://creativecommons.org/licenses/by-sa/2.0/'
const bySa4 = 'https://creativecommons.org/licenses/by-sa/4.0/'
const by2 = 'https://creativecommons.org/licenses/by/2.0/'


export const habitatProfiles: Record<SpeciesId, HabitatProfile> = {
  'Spheniscus mendiculus': {
    habitat: {
      es: 'Litoral volcánico de las islas occidentales: roca desnuda, grietas de lava junto al mar y aguas costeras someras y frías.',
      en: 'The volcanic shore of the western islands: bare rock, lava crevices by the sea and cold, shallow coastal water.',
    },
    feeding: {
      es: 'Se alimenta de peces pequeños de cardumen que captura en aguas costeras.',
      en: 'It feeds on small schooling fish taken in coastal water.',
    },
    sstRelation: {
      es: 'La temperatura superficial describe el agua fría y productiva de la surgencia de la que depende, de forma indirecta: el vínculo pasa por los peces que consume, no por el agua que el pingüino toca.',
      en: 'Sea surface temperature describes the cool, productive upwelled water it depends on, indirectly: the link runs through the fish it eats, not the water the penguin touches.',
    },
    chlorophyllRelation: {
      es: 'La clorofila-a es un indicador aproximado de la abundancia de fitoplancton en la base de la red alimentaria. No mide el alimento del pingüino y su efecto llegaría con retraso a través de la red trófica.',
      en: 'Chlorophyll-a is a proxy for phytoplankton abundance at the base of the food web. It does not measure the penguin’s food, and any effect would reach it with a delay through the food web.',
    },
    sensitivity: {
      es: 'Los estudios registran cambios en el uso del espacio, dietas menos favorables y descensos marcados del éxito reproductivo y de la supervivencia en los episodios cálidos.',
      en: 'Studies document changes in space use, less favourable diets and marked drops in breeding success and survival during warm episodes.',
    },
    physiology: {
      es: 'Los pesajes de aves en campo documentaron un deterioro de la condición corporal durante episodios cálidos.',
      en: 'Field measurements of body mass documented poorer body condition during warm episodes.',
    },
    images: [
      image('penguin-fernandina-pair', true, 'Judy Gallagher', 'CC BY 2.0', by2,
        'https://commons.wikimedia.org/wiki/File:189_365_Galapagos_Penguin_-_Spheniscus_mendiculus,_Fernandina_Island,_Galapagos,_Ecuador,_July_8,_2021_(51329133046).jpg',
        { es: 'Dos pingüinos de Galápagos en una orilla de lava.', en: 'Two Galápagos penguins on a lava shore.' },
        { es: 'Isla Fernandina, Galápagos', en: 'Fernandina Island, Galápagos' }),
      image('penguin-tagus-lava', true, 'putneymark', 'CC BY-SA 2.0', bySa2,
        'https://commons.wikimedia.org/wiki/File:Galapagos_penguins_(Spheniscus_mendiculus)_-Tagus_Cove_-Isabela.jpg',
        { es: 'Pingüinos sobre roca oscura de lava junto al mar.', en: 'Penguins on dark lava rock by the sea.' },
        { es: 'Tagus Cove, Isabela, Galápagos', en: 'Tagus Cove, Isabela, Galápagos' }),
      image('penguin-rocky-group', true, 'Pete', 'CC BY-SA 2.0', bySa2,
        'https://commons.wikimedia.org/wiki/File:Galapagos_Penguin_(Spheniscus_mendiculus)_-3_on_rock_by_sea.jpg',
        { es: 'Tres pingüinos de Galápagos sobre roca junto al mar.', en: 'Three Galápagos penguins on rock by the sea.' },
        { es: 'Galápagos', en: 'Galápagos' }),
    ],
  },

  'Amblyrhynchus cristatus': {
    habitat: {
      es: 'Orilla rocosa y de lava de casi todas las islas: franja intermareal, fondo somero y rocas negras donde recupera temperatura tras cada inmersión.',
      en: 'Rocky and lava shoreline of almost every island: the intertidal fringe, the shallow seabed and the black rocks where it regains temperature after every dive.',
    },
    feeding: {
      es: 'Es herbívora: pastorea algas rojas y verdes del fondo y de la franja que queda al descubierto con la marea baja.',
      en: 'It is herbivorous: it grazes red and green algae from the seabed and the fringe exposed at low tide.',
    },
    sstRelation: {
      es: 'La iguana intercambia calor con el agua durante el buceo y con las rocas en tierra. La SST regional no mide su temperatura corporal ni el agua de una inmersión concreta.',
      en: 'An iguana exchanges heat with water while diving and with rocks on land. Regional SST does not measure its body temperature or the water on a particular dive.',
    },
    chlorophyllRelation: {
      es: 'La clorofila-a mide el fitoplancton, no las algas bentónicas que come. Se muestra como contexto del sistema y nunca como su alimento.',
      en: 'Chlorophyll-a measures phytoplankton, not the benthic algae it eats. It is shown as context for the system and never as its food.',
    },
    sensitivity: {
      es: 'Responde a la escasez de algas de los episodios cálidos con respuestas medibles: menor metabolismo, reducción de la longitud corporal y corticosterona relacionada con la probabilidad de sobrevivir.',
      en: 'It responds to the algal scarcity of warm episodes with measurable responses: lower metabolism, a reduction in body length and corticosterone related to survival probability.',
    },
    physiology: {
      es: 'Tasa metabólica baja para un lagarto de su tamaño y temperatura corporal dependiente del ambiente, por lo que necesita las rocas para calentarse tras bucear en agua fría.',
      en: 'A low metabolic rate for a lizard of its size and an environment-dependent body temperature, so it needs rocks to warm up after diving in cold water.',
    },
    images: [
      image('iguana-lasbachas', true, 'Diego Delso', 'CC BY-SA 4.0', bySa4,
        'https://commons.wikimedia.org/wiki/File:Iguana_marina_(Amblyrhynchus_cristatus),_Las_Bachas,_isla_Santa_Cruz,_islas_Gal%C3%A1pagos,_Ecuador,_2015-07-23,_DD_23.jpg',
        { es: 'Iguana marina sobre roca en la orilla intermareal.', en: 'Marine iguana on rock in the intertidal shore.' },
        { es: 'Las Bachas, Santa Cruz, Galápagos', en: 'Las Bachas, Santa Cruz, Galápagos' }),
      image('iguana-fernandina', true, 'Andrew Turner', 'CC BY 2.0', by2,
        'https://commons.wikimedia.org/wiki/File:Mountain_of_Marine_Iguanas_(6519187799).jpg',
        { es: 'Colonia de iguanas marinas sobre lava costera.', en: 'Colony of marine iguanas on coastal lava.' },
        { es: 'Punta Espinosa, Fernandina, Galápagos', en: 'Punta Espinosa, Fernandina, Galápagos' }),
      image('iguana-lobos', true, 'Diego Delso', 'CC BY-SA 4.0', bySa4,
        'https://commons.wikimedia.org/wiki/File:Iguana_marina_(Amblyrhynchus_cristatus),_isla_Lobos,_islas_Gal%C3%A1pagos,_Ecuador,_2015-07-25,_DD_47.JPG',
        { es: 'Iguana marina juvenil en la costa rocosa.', en: 'Juvenile marine iguana on the rocky coast.' },
        { es: 'Isla Lobos, Galápagos', en: 'Lobos Island, Galápagos' }),
    ],
  },

  'Zalophus wollebaeki': {
    habitat: {
      es: 'Playas y costas rocosas donde forma colonias de cría y descanso, junto a aguas costeras de forrajeo.',
      en: 'Beaches and rocky shores where it forms breeding and resting colonies, next to coastal foraging water.',
    },
    feeding: {
      es: 'Se alimenta de peces y cefalópodos que captura en inmersiones.',
      en: 'It feeds on fish and cephalopods caught during dives.',
    },
    sstRelation: {
      es: 'La temperatura superficial describe el ambiente donde forrajea, no una inmersión concreta ni la presa capturada un día determinado.',
      en: 'Sea surface temperature describes the environment where it forages, not a particular dive or the prey caught on a given day.',
    },
    chlorophyllRelation: {
      es: 'La clorofila-a apunta a la producción planctónica que, a través de la red trófica, sostiene a sus presas. Es una interpretación, no una medición del alimento disponible.',
      en: 'Chlorophyll-a points to the plankton production that, through the food web, sustains its prey. It is an interpretation, not a measurement of available food.',
    },
    sensitivity: {
      es: 'Durante El Niño cae la disponibilidad de alimento y la especie responde con descensos de la supervivencia de crías y de la población: en 2015 se contaron menos individuos en las colonias que en 2014.',
      en: 'During El Niño food availability falls and the species responds with declines in pup survival and population size: fewer animals were counted at the colonies in 2015 than in 2014.',
    },
    physiology: {
      es: 'Requerimientos energéticos bajos para un otárido de su tamaño, ajustados a un ambiente poco productivo, con plasticidad en sus reservas de oxígeno ligada al buceo y la gestación.',
      en: 'Low energy requirements for an otariid of its size, adjusted to a low-productivity environment, with plasticity in oxygen stores linked to diving and pregnancy.',
    },
    images: [
      image('sealion-santafe', true, 'Bernard Gagnon', 'CC BY-SA 4.0', bySa4,
        'https://commons.wikimedia.org/wiki/File:Gal%C3%A1pagos_sea_lion,_Santa_Fe_Island_01.jpg',
        { es: 'Lobo marino joven en la costa.', en: 'Young sea lion on the coast.' },
        { es: 'Santa Fe, Galápagos', en: 'Santa Fe, Galápagos' }),
      image('sealion-puntapitt', true, 'Diego Delso', 'CC BY-SA 4.0', bySa4,
        'https://commons.wikimedia.org/wiki/File:Lobos_marinos_(Zalophus_californianus_wollebaeki),_Punta_Pitt,_isla_de_San_Crist%C3%B3bal,_islas_Gal%C3%A1pagos,_Ecuador,_2015-07-24,_DD_06.JPG',
        { es: 'Colonia de lobos marinos en la costa rocosa.', en: 'Sea lion colony on the rocky coast.' },
        { es: 'Punta Pitt, San Cristóbal, Galápagos', en: 'Punta Pitt, San Cristóbal, Galápagos' }),
      image('sealion-espanola', true, "Mike's Birds", 'CC BY-SA 2.0', bySa2,
        'https://commons.wikimedia.org/wiki/File:Sea_lions_(32819956607).jpg',
        { es: 'Lobos marinos en la orilla.', en: 'Sea lions on the shore.' },
        { es: 'Española, Galápagos', en: 'Española, Galápagos' }),
    ],
  },

  'Nannopterum harrisi': {
    habitat:{es:'Costas de lava de Isabela y Fernandina, con lugares de anidación próximos a aguas someras.',en:'Lava shores of Isabela and Fernandina, with nesting sites close to shallow water.'},
    feeding:{es:'Bucea cerca del fondo para capturar peces y otras presas costeras.',en:'It dives close to the seabed to take fish and other coastal prey.'},
    sstRelation:regionalSST,
    chlorophyllRelation:{es:'El pigmento superficial aporta contexto sobre el fitoplancton. La abundancia de peces en las zonas de buceo requiere muestreos propios.',en:'Surface pigment provides context about phytoplankton. Fish abundance in diving grounds requires separate sampling.'},
    sensitivity:{es:'El seguimiento de una colonia vinculó las aguas frías persistentes con más puestas y juveniles criados.',en:'Colony monitoring linked persistent cold waters with more clutches and more fledged young.'},
    images:[
      image('cormorant-shore',true,'David Stanley','CC BY 2.0',by2,
        'https://commons.wikimedia.org/wiki/File:Flightless_Cormorant_(49528126627).jpg',
        {es:'Cormorán con las alas extendidas junto al mar.',en:'A cormorant with wings spread at the water’s edge.'},{es:'Fernandina, Galápagos',en:'Fernandina, Galápagos'}),
      image('cormorant-water',true,'putneymark','CC BY-SA 2.0',bySa2,
        'https://commons.wikimedia.org/wiki/File:Flightless_Cormorant_(Phalacrocorax_harrisi)_-swimming2.jpg',
        {es:'Cormorán nadando en aguas costeras.',en:'A cormorant swimming in coastal water.'},{es:'Fernandina, Galápagos',en:'Fernandina, Galápagos'}),
      image('cormorant-nest',true,'Dan','CC BY-SA 2.0',bySa2,
        'https://commons.wikimedia.org/wiki/File:Flightless_Cormorant_nesting_on_Fernandina_Island.jpg',
        {es:'Cormorán en su nido sobre la costa rocosa.',en:'A cormorant on its nest on the rocky coast.'},{es:'Fernandina, Galápagos',en:'Fernandina, Galápagos'}),
    ],
  },
  'Arctocephalus galapagoensis': {
    habitat:{es:'Litoral rocoso con plataformas de descanso y acceso al mar. Santiago alberga sitios de observación en Puerto Egas.',en:'Rocky shores with haul-out ledges and access to the sea. Santiago has observation sites at Puerto Egas.'},
    feeding:{es:'Captura peces y calamares durante sus viajes de alimentación.',en:'It catches fish and squid on feeding trips.'},
    sstRelation:regionalSST,
    chlorophyllRelation:{es:'El fitoplancton sostiene redes alimentarias de las que dependen sus presas. Para saber qué comió un lobo peletero se necesitan datos de dieta.',en:'Phytoplankton supports food webs used by its prey. Knowing what an individual ate requires diet data.'},
    sensitivity:{es:'Se documentaron pérdidas de crías durante el episodio de 1982–1983 y descensos en los recuentos de colonias en 2015.',en:'Studies recorded pup losses during the 1982–1983 episode and lower colony counts in 2015.'},
    images:[
      image('furseal-egas',true,'putneymark','CC BY-SA 2.0',bySa2,
        'https://commons.wikimedia.org/wiki/File:Galapagos_fur_seal_Santiago_Puerto_Egas.jpg',
        {es:'Lobo peletero descansando entre rocas de lava.',en:'A fur seal resting between lava rocks.'},{es:'Puerto Egas, Santiago, Galápagos',en:'Puerto Egas, Santiago, Galápagos'}),
      image('furseal-santiago',true,'Nicolas Völcker / Wikimedia Commons','CC BY-SA 4.0',bySa4,
        'https://commons.wikimedia.org/wiki/File:20180808-Gal%C3%A1pagos_fur_seal-14_at_Santiago_(9799).jpg',
        {es:'Lobos peleteros en el litoral volcánico de Santiago.',en:'Fur seals on Santiago’s volcanic shore.'},{es:'Santiago, Galápagos',en:'Santiago, Galápagos'}),
      image('furseal-lava',true,'Nicolas Völcker / Wikimedia Commons','CC BY-SA 4.0',bySa4,
        'https://commons.wikimedia.org/wiki/File:20180808-Gal%C3%A1pagos_fur_seal_at_Santiago_(9780).jpg',
        {es:'Lobo peletero sobre la superficie irregular de la lava.',en:'A fur seal on the uneven lava surface.'},{es:'Santiago, Galápagos',en:'Santiago, Galápagos'}),
    ],
  },
}
