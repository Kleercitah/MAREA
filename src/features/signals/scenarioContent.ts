import type { LocalizedText, SpeciesId } from '../../data/contracts'
import type { ProductivityScenario, ThermalScenario } from './scenarios'

const copy = (es: string, en: string): LocalizedText => ({ es, en })

/**
 * Lectura de un eje del escenario para una especie concreta.
 * Cubre los puntos 1 a 4 y 7 de la interpretación ecológica profunda:
 * qué cambia en el océano, qué alimento está implicado, qué mecanismo se ha
 * estudiado, qué se documentó históricamente y qué evidencia lo respalda.
 */
export interface AxisReading {
  /** 1. Qué cambia físicamente en el océano. */
  physical: LocalizedText
  /** 2. Qué recursos alimenticios pueden estar relacionados. */
  food: LocalizedText
  /** 3. Qué mecanismos biológicos han sido estudiados. */
  mechanism: LocalizedText
  /** 4. Qué se documentó históricamente; la respuesta negativa de El Niño cuando existe. */
  historic: LocalizedText
  /** 7. Qué evidencia respalda esa relación. */
  citations: string[]
}

export const thermalReadings: Record<SpeciesId, Record<ThermalScenario, AxisReading>> = {
  'Spheniscus mendiculus': {
    warming: {
      physical: copy(
        'La superficie del océano se calienta y el afloramiento se debilita en el Pacífico oriental. La termoclina se profundiza, ascienden menos nutrientes y la surgencia fría de las islas occidentales —donde se concentra el pingüino— pierde intensidad.',
        'The ocean surface warms and upwelling weakens across the eastern Pacific. The thermocline deepens, fewer nutrients rise, and the cold upwelling of the western islands —where the penguin is concentrated— loses strength.',
      ),
      food: copy(
        'Captura peces pequeños de cardumen en aguas costeras. Esos cardúmenes dependen del plancton que produce el afloramiento; con menos nutrientes pueden dispersarse y alejarse de las colonias.',
        'It catches small schooling fish in coastal water. Those schools depend on the plankton upwelling produces; with fewer nutrients they can disperse away from the colonies.',
      ),
      mechanism: copy(
        'Cuando el alimento se aleja, los adultos cubren más distancia durante la crianza. Los seguimientos registran entonces peor condición corporal, menos nidadas y escaso reclutamiento de juveniles.',
        'When food moves away, adults cover more distance while raising chicks. Monitoring then records poorer body condition, fewer clutches and low juvenile recruitment.',
      ),
      historic: copy(
        'En las costas censadas de Isabela y Fernandina se contaron 1716 pingüinos en 1980 y 398 en 1983, un descenso del 77 %. Tras el episodio, la proporción de juveniles siguió siendo baja.',
        'Surveys along Isabela and Fernandina counted 1,716 penguins in 1980 and 398 in 1983, a 77% decline. After the event the share of juveniles stayed low.',
      ),
      citations: ['boersma-1998', 'valle-1987-condor', 'vargas-2006'],
    },
    cooling: {
      physical: copy(
        'El afloramiento se intensifica: el agua superficial queda más fría y rica en nutrientes junto a las islas occidentales y el canal de Bolívar.',
        'Upwelling intensifies: surface water turns colder and richer in nutrients next to the western islands and the Bolívar Channel.',
      ),
      food: copy(
        'Una producción primaria sostenida mantiene a los consumidores intermedios que forman los cardúmenes de peces pequeños cerca de la costa.',
        'Sustained primary production supports the intermediate consumers that form the small-fish schools close to shore.',
      ),
      mechanism: copy(
        'Las condiciones frías de La Niña se han asociado con mejores temporadas de cría y mayor reclutamiento en las colonias seguidas.',
        'La Niña’s cool conditions have been associated with better breeding seasons and higher recruitment in monitored colonies.',
      ),
      historic: copy(
        'La relación favorable no es lineal: un enfriamiento muy intenso o prolongado también desplaza a las presas, y no existe un censo que muestre un beneficio ilimitado al enfriarse más el agua.',
        'The favourable link is not linear: very intense or prolonged cooling also shifts prey, and no survey shows an unlimited benefit from colder water.',
      ),
      citations: ['boersma-1998', 'karnauskas-2015'],
    },
    near: {
      physical: copy(
        'Condiciones cercanas a la referencia mensual: la mezcla habitual entre surgencia fría y aguas cálidas estacionales.',
        'Conditions near the monthly reference: the usual mix of cold upwelling and seasonally warm water.',
      ),
      food: copy(
        'Los cardúmenes mantienen su distribución estacional dentro del alcance de las colonias.',
        'Schools keep their seasonal distribution within reach of the colonies.',
      ),
      mechanism: copy(
        'El funcionamiento habitual: la surgencia sostiene la producción primaria y, a través de la red trófica, a los peces que el pingüino captura.',
        'Business as usual: upwelling sustains primary production and, through the food web, the fish the penguin catches.',
      ),
      historic: copy(
        'Estar cerca de la referencia no implica por sí solo que la población esté sana; la especie sigue considerándose una de las más amenazadas del archipiélago.',
        'Being near the reference does not by itself mean the population is healthy; the species is still considered among the most threatened in the archipelago.',
      ),
      citations: ['boersma-1998', 'bollmer-2007'],
    },
  },
  'Amblyrhynchus cristatus': {
    warming: {
      physical: copy(
        'El agua superficial se calienta y el afloramiento se debilita. En el intermareal, el pasto de algas —que crece pegado a la roca y depende de nutrientes, oleaje y luz— queda sometido a menos nutrientes y a estrés térmico.',
        'Surface water warms and upwelling weakens. In the intertidal zone the algal turf —which grows attached to rock and depends on nutrients, waves and light— faces fewer nutrients and thermal stress.',
      ),
      food: copy(
        'La iguana es herbívora y pasta algas rojas y verdes. En Santa Fe, durante El Niño de 1982–1983 desaparecieron muchas de las algas preferidas y se extendió el alga parda Giffordia mitchelliae, menos adecuada como alimento.',
        'The iguana is a herbivore grazing red and green algae. On Santa Fe, during the 1982–1983 El Niño many preferred algae disappeared and the brown alga Giffordia mitchelliae —less suitable as food— spread.',
      ),
      mechanism: copy(
        'Con menos alimento, los individuos reducen su metabolismo para ahorrar energía; la longitud corporal puede disminuir y las concentraciones de corticosterona se relacionan con la condición corporal y con la probabilidad de sobrevivir.',
        'With less food, individuals lower their metabolism to save energy; body length can shrink and corticosterone concentrations track body condition and survival probability.',
      ),
      historic: copy(
        'En Santa Fe, el seguimiento por marcaje y recaptura estimó una mortalidad por inanición del 60–70 % durante El Niño. Casi toda la cohorte nacida en 1982 desapareció y la reproducción se interrumpió la temporada siguiente.',
        'On Santa Fe, mark–recapture monitoring estimated 60–70% starvation mortality during El Niño. Nearly the entire 1982 hatchling cohort was lost and breeding stopped the following season.',
      ),
      citations: ['laurie-brown-1990', 'laurie-1990-enso', 'romero-wikelski-2001', 'wikelski-thom-2000', 'dubiner-2025'],
    },
    cooling: {
      physical: copy(
        'Afloramiento más intenso: aguas frías y ricas en nutrientes junto a la costa, sobre todo en las islas occidentales.',
        'Stronger upwelling: cold, nutrient-rich water next to the shore, especially in the western islands.',
      ),
      food: copy(
        'Más nutrientes pueden favorecer el crecimiento de las algas que pasta; la composición del pasto responde además al oleaje y a la exposición de cada costa.',
        'More nutrients can favour the growth of the algae it grazes; turf composition also responds to waves and to the exposure of each shore.',
      ),
      mechanism: copy(
        'La iguana tiene una tasa metabólica baja para un lagarto de su tamaño y necesita las rocas negras para recuperar temperatura tras cada inmersión en agua fría. El frío no es un problema en sí, siempre que haya algas.',
        'The iguana has a low metabolic rate for a lizard of its size and needs black rocks to regain temperature after each dive in cold water. The cold is not a problem by itself, as long as algae are available.',
      ),
      historic: copy(
        'Los estudios históricos vinculan la escasez de algas con el calentamiento de El Niño, no con el enfriamiento; no hay evidencia de que enfriar más el agua sea favorable sin límite.',
        'Historical studies link algal scarcity to warm El Niño, not to cooling; there is no evidence that colder water is beneficial without limit.',
      ),
      citations: ['laurie-1990-enso', 'vinueza-2006', 'wikelski-1997'],
    },
    near: {
      physical: copy(
        'Condiciones cercanas a la referencia; el intermareal sigue expuesto a la marea, el oleaje y la luz de cada día.',
        'Conditions near the reference; the intertidal shore is still exposed to tide, waves and daily light.',
      ),
      food: copy(
        'El pasto de algas mantiene su composición habitual; la iguana pasta en el fondo y en la franja que descubre la marea baja.',
        'Algal turf keeps its usual composition; the iguana grazes on the seabed and on the fringe exposed at low tide.',
      ),
      mechanism: copy(
        'El funcionamiento habitual de la herbivoría: las iguanas consumen algas y su efecto se combina con el de los cangrejos y los peces herbívoros que viven en la misma orilla.',
        'The usual working of herbivory: iguanas consume algae and their effect combines with that of crabs and herbivorous fish living on the same shore.',
      ),
      historic: copy(
        'Incluso en condiciones habituales, la disponibilidad de algas varía con la estación y con cada costa; no toda esa variación depende de la temperatura.',
        'Even under usual conditions, algal availability varies with season and with each shore; not all of that variation depends on temperature.',
      ),
      citations: ['vinueza-2006', 'laurie-1990-enso'],
    },
  },
  'Zalophus wollebaeki': {
    warming: {
      physical: copy(
        'El agua superficial se calienta y el afloramiento se debilita; la producción primaria baja y la termoclina se profundiza en la región.',
        'Surface water warms and upwelling weakens; primary production falls and the thermocline deepens across the region.',
      ),
      food: copy(
        'Se alimenta de peces y cefalópodos. Con menos producción, sus presas pueden dispersarse o descender y alejarse de las colonias.',
        'It feeds on fish and cephalopods. With less production its prey can disperse or descend, moving away from the colonies.',
      ),
      mechanism: copy(
        'La madre alterna viajes de alimentación en el mar con visitas para amamantar en tierra. Si las presas se alejan, los viajes se alargan y las crías, que dependen de la leche, pasan más tiempo sin comer.',
        'Mothers alternate feeding trips at sea with nursing visits ashore. If prey move away, trips lengthen and pups, which depend on milk, go longer without food.',
      ),
      historic: copy(
        'En 32 colonias de 13 islas, los recuentos de 2015 cayeron un 23,9 % respecto a 2014 y el recuento de crías bajó un 40,5 %. En Santa Fe, en 1983, solo 19 de 140 crías seguían vivas a los cinco meses.',
        'Across 32 colonies on 13 islands, 2015 counts fell 23.9% relative to 2014 and pup counts fell 40.5%. On Santa Fe in 1983 only 19 of 140 pups survived their first five months.',
      ),
      citations: ['paez-rosas-2021', 'trillmich-limberger-1985', 'villegas-amtmann-2017'],
    },
    cooling: {
      physical: copy(
        'Afloramiento más intenso: agua fría y productiva en las zonas de forrajeo costero.',
        'Stronger upwelling: cold, productive water in the coastal foraging grounds.',
      ),
      food: copy(
        'Más producción primaria puede sostener a los peces costeros que consume y acercar a las presas a las colonias.',
        'More primary production can support the coastal fish it eats and bring prey closer to the colonies.',
      ),
      mechanism: copy(
        'Con presas más accesibles, las madres pueden acortar los viajes y volver antes a amamantar, lo que favorece a las crías.',
        'With more accessible prey, mothers can shorten trips and return sooner to nurse, benefiting pups.',
      ),
      historic: copy(
        'La relación favorable está documentada para la especie, pero no es ilimitada: el efecto del frío depende de dónde se concentren las presas, y ningún censo lo cuantifica.',
        'The favourable link is documented for the species but is not unlimited: the effect of cooling depends on where prey concentrate, and no survey quantifies it.',
      ),
      citations: ['trillmich-limberger-1985', 'riofrio-lazo-2017'],
    },
    near: {
      physical: copy(
        'Condiciones cercanas a la referencia: el ambiente marino habitual alrededor de las colonias.',
        'Conditions near the reference: the usual marine environment around the colonies.',
      ),
      food: copy(
        'Peces y cefalópodos mantienen su distribución estacional; el lobo marino forrajea en aguas costeras cercanas.',
        'Fish and cephalopods keep their seasonal distribution; the sea lion forages in nearby coastal water.',
      ),
      mechanism: copy(
        'Con el alimento habitual, los recuentos en una colonia dependen de cuántas madres están en el mar en ese momento; la asistencia a tierra varía por sí sola.',
        'With usual food, colony counts depend on how many mothers are at sea at that moment; attendance ashore varies on its own.',
      ),
      historic: copy(
        'Estar cerca de la referencia no garantiza una población sana: en los recuentos influye cuántos animales están en tierra, no solo cuántos existen.',
        'Being near the reference does not guarantee a healthy population: counts reflect how many animals are ashore, not only how many exist.',
      ),
      citations: ['riofrio-lazo-2017', 'paez-rosas-2021'],
    },
  },
  'Nannopterum harrisi': {
    warming: {
      physical: copy(
        'El agua superficial se calienta y el afloramiento que mantiene frías las aguas someras de Isabela y Fernandina se debilita.',
        'Surface water warms and the upwelling that keeps the shallow waters of Isabela and Fernandina cool weakens.',
      ),
      food: copy(
        'El cormorán bucea cerca del fondo para capturar peces y otras presas costeras. Si las aguas frías se retiran, las presas del fondo pueden cambiar de distribución en sus zonas de buceo.',
        'The cormorant dives near the seabed for fish and other coastal prey. If the cool water retreats, bottom prey may shift within its diving grounds.',
      ),
      mechanism: copy(
        'En una colonia de Punta Espinosa seguida durante diez años, la persistencia de aguas frías se asoció con más puestas y más juveniles criados; los autores propusieron una mayor disponibilidad de presas como explicación.',
        'In a Punta Espinosa colony monitored for ten years, persistent cool water was associated with more clutches and more fledglings; the authors proposed greater prey availability as the explanation.',
      ),
      historic: copy(
        'En las costas de Isabela y Fernandina se contaron 802 cormoranes en 1980 y 409 en 1983, un descenso del 49 %. El censo registró aves presentes, no el destino de cada adulto.',
        'Coastal surveys on Isabela and Fernandina counted 802 cormorants in 1980 and 409 in 1983, a 49% decline. The survey recorded birds present, not the fate of each adult.',
      ),
      citations: ['tindle-2013', 'valle-1987-condor'],
    },
    cooling: {
      physical: copy(
        'Afloramiento intenso: aguas frías que persisten en las zonas someras de buceo del occidente.',
        'Intense upwelling: cool water that persists in the shallow western diving grounds.',
      ),
      food: copy(
        'Las aguas frías se asocian a presas más disponibles cerca del fondo, en los tramos de costa que el cormorán usa para criar.',
        'Cool water is associated with more available prey near the seabed, along the stretches of coast the cormorant uses to breed.',
      ),
      mechanism: copy(
        'Con presas accesibles, el esfuerzo de buceo se concentra cerca del nido; la reproducción documentada fue mejor cuando el agua fría persistía.',
        'With accessible prey, diving effort concentrates near the nest; documented breeding was better when cool water persisted.',
      ),
      historic: copy(
        'Las buenas temporadas no dependen del frío en abstracto, sino de que se mantenga cerca de la colonia; un promedio regional amplio incluye aguas que el cormorán nunca visita.',
        'Good seasons depend not on cold in the abstract but on it persisting near the colony; a broad regional mean includes water the cormorant never visits.',
      ),
      citations: ['tindle-2013'],
    },
    near: {
      physical: copy(
        'Condiciones cercanas a la referencia en un promedio regional que puede ocultar diferencias entre costas.',
        'Conditions near the reference in a regional mean that can hide differences between shores.',
      ),
      food: copy(
        'La especie depende de presas cercanas al fondo en tramos concretos de costa, más que del valor medio de la región.',
        'The species depends on prey near the seabed on specific stretches of coast, more than on the region’s mean value.',
      ),
      mechanism: copy(
        'El funcionamiento habitual: el cormorán bucea cerca de su colonia y no realiza grandes desplazamientos.',
        'Business as usual: the cormorant dives close to its colony and does not make large movements.',
      ),
      historic: copy(
        'Su distribución geográfica es muy limitada —solo Isabela y Fernandina—, por lo que las condiciones locales importan más que las regionales.',
        'Its geographic range is very limited —Isabela and Fernandina only— so local conditions matter more than regional ones.',
      ),
      citations: ['tindle-2013', 'valle-1987-condor'],
    },
  },
  'Arctocephalus galapagoensis': {
    warming: {
      physical: copy(
        'El agua superficial se calienta y la producción baja; el ambiente oceánico que sostiene a las presas pelágicas y mesopelágicas cambia.',
        'Surface water warms and production falls; the ocean environment supporting pelagic and midwater prey changes.',
      ),
      food: copy(
        'Se alimenta de peces y calamares, entre ellos peces mesopelágicos que ascienden de noche. Si la producción baja, estas presas pueden volverse menos accesibles.',
        'It feeds on fish and squid, including midwater fish that rise at night. If production falls, these prey can become less accessible.',
      ),
      mechanism: copy(
        'Las madres realizan viajes de alimentación y regresan a amamantar. En Cabo Hammond, la mediana de los viajes pasó de 1,3 días en 1979–1980 a 3,5 en 1982; las crías dependen del intervalo entre visitas.',
        'Mothers make feeding trips and return to nurse. At Cabo Hammond the median trip rose from 1.3 days in 1979–1980 to 3.5 in 1982; pups depend on the interval between visits.',
      ),
      historic: copy(
        'Ninguna de las 18 crías seguidas en Cabo Hammond a finales de 1982 sobrevivió sus primeros cinco meses. En 11 colonias de siete islas, los recuentos de 2015 cayeron un 38,1 % respecto a 2014.',
        'None of the 18 pups followed at Cabo Hammond in late 1982 survived their first five months. Across 11 colonies on seven islands, 2015 counts fell 38.1% relative to 2014.',
      ),
      citations: ['trillmich-limberger-1985', 'paez-rosas-2021', 'fur-diet'],
    },
    cooling: {
      physical: copy(
        'Afloramiento más intenso: agua fría y productiva en el ambiente pelágico.',
        'Stronger upwelling: cold, productive water in the pelagic environment.',
      ),
      food: copy(
        'Más producción puede sostener a los peces y calamares de los que depende, incluidos los mesopelágicos nocturnos.',
        'More production can support the fish and squid it depends on, including nocturnal midwater species.',
      ),
      mechanism: copy(
        'Con presas más accesibles, los viajes maternos pueden acortarse; el seguimiento registró viajes más cortos después del episodio.',
        'With more accessible prey, maternal trips can shorten; monitoring recorded shorter trips after the event.',
      ),
      historic: copy(
        'La respuesta favorable no es automática: depende de la profundidad y del momento en que las presas estén al alcance, no solo del frío en superficie.',
        'The favourable response is not automatic: it depends on the depth and timing of prey accessibility, not only on surface cold.',
      ),
      citations: ['trillmich-limberger-1985', 'fur-diet'],
    },
    near: {
      physical: copy(
        'Condiciones cercanas a la referencia en la superficie.',
        'Conditions near the reference at the surface.',
      ),
      food: copy(
        'Aun con condiciones superficiales habituales, los peces migran verticalmente de noche y las presas se sitúan a profundidad.',
        'Even under typical surface conditions, fish migrate vertically at night and prey sit at depth.',
      ),
      mechanism: copy(
        'El funcionamiento habitual: el lobo peletero busca presas pelágicas y mesopelágicas y regresa a la colonia a amamantar.',
        'Business as usual: the fur seal seeks pelagic and midwater prey and returns to the colony to nurse.',
      ),
      historic: copy(
        'La accesibilidad a profundidad no se mide con la temperatura de la superficie; hace falta seguimiento de buceo.',
        'Accessibility at depth is not measured by surface temperature; dive monitoring is needed.',
      ),
      citations: ['trillmich-limberger-1985', 'fur-diet'],
    },
  },
}

export const productivityReadings: Record<SpeciesId, Record<ProductivityScenario, AxisReading>> = {
  'Spheniscus mendiculus': {
    higher: {
      physical: copy(
        'Más pigmento fotosintético en la superficie: señal de mayor biomasa de fitoplancton, el primer eslabón de la red alimentaria.',
        'More photosynthetic pigment at the surface: a sign of greater phytoplankton biomass, the first link of the food web.',
      ),
      food: copy(
        'El fitoplancton alimenta al zooplancton y a los peces pequeños; un aumento puede reforzar a los consumidores intermedios que sostienen al pingüino, con retraso temporal.',
        'Phytoplankton feeds zooplankton and small fish; an increase can strengthen the intermediate consumers that support the penguin, with a time lag.',
      ),
      mechanism: copy(
        'Un pico de clorofila no equivale a una mejora inmediata: la energía debe recorrer varios pasos tróficos antes de llegar a los peces que captura el ave.',
        'A chlorophyll peak is not an immediate gain: the energy must pass through several trophic steps before reaching the fish the bird catches.',
      ),
      historic: copy(
        'No hay conteos de presas que confirmen que más clorofila se traduzca en más peces al alcance de las colonias.',
        'No prey counts confirm that more chlorophyll translates into more fish within reach of the colonies.',
      ),
      citations: ['boersma-1998'],
    },
    lower: {
      physical: copy(
        'Menos fitoplancton superficial: una base productiva más pobre en el momento de la observación.',
        'Less surface phytoplankton: a poorer productive base at the time of observation.',
      ),
      food: copy(
        'Con menos producción primaria puede bajar la biomasa de los consumidores intermedios; los cardúmenes de los que depende el pingüino podrían verse afectados.',
        'With less primary production the biomass of intermediate consumers can fall; the schools the penguin depends on could be affected.',
      ),
      mechanism: copy(
        'Los estudios son coherentes con esta vía indirecta, pero miden aves y no peces: no hay conteos de presas que confirmen la cadena.',
        'Studies are consistent with this indirect path, but they measure birds, not fish: no prey counts confirm the chain.',
      ),
      historic: copy(
        'Una concentración menor de clorofila no implica por sí sola un colapso: refleja una base productiva más baja, cuyo efecto sobre los peces no se ha medido.',
        'A lower chlorophyll concentration does not by itself mean a collapse: it reflects a smaller productive base whose effect on fish has not been measured.',
      ),
      citations: ['boersma-1998', 'vargas-2006'],
    },
    near: {
      physical: copy(
        'Clorofila en torno a su valor habitual: producción primaria dentro de la variación normal.',
        'Chlorophyll around its usual value: primary production within normal variation.',
      ),
      food: copy(
        'La base de la red mantiene su nivel estacional; la disponibilidad de peces responde además a procesos locales.',
        'The base of the web keeps its seasonal level; fish availability also responds to local processes.',
      ),
      mechanism: copy(
        'Con la producción habitual, la pregunta para la colonia sigue siendo la distancia a los cardúmenes, no la cantidad de plancton superficial.',
        'With normal production, the question for the colony is still the distance to fish schools, not the amount of surface plankton.',
      ),
      historic: copy(
        'La clorofila próxima a la referencia no informa por sí sola sobre la distribución de los peces ni sobre el estado de la colonia.',
        'Chlorophyll near the reference says nothing on its own about fish distribution or the state of the colony.',
      ),
      citations: ['boersma-1998'],
    },
  },
  'Amblyrhynchus cristatus': {
    higher: {
      physical: copy(
        'Más fitoplancton en la columna de agua: un indicador del sistema pelágico, no del pasto de algas pegado a la roca.',
        'More phytoplankton in the water column: an indicator of the pelagic system, not of the algal turf attached to rock.',
      ),
      food: copy(
        'La clorofila-a no mide las algas bentónicas que come la iguana. Un aumento del plancton puede no traducirse en más pasto intermareal.',
        'Chlorophyll-a does not measure the benthic algae the iguana eats. A rise in plankton need not translate into more intertidal turf.',
      ),
      mechanism: copy(
        'Confundir el plancton con su alimento sería un error: la iguana depende de algas bentónicas, cuya abundancia responde a nutrientes, oleaje y competencia entre herbívoros.',
        'Confusing plankton with its food would be a mistake: the iguana depends on benthic algae whose abundance responds to nutrients, waves and competition among grazers.',
      ),
      historic: copy(
        'No existe un vínculo establecido entre la clorofila superficial y la cantidad de algas que pasta la iguana.',
        'No link is established between surface chlorophyll and the amount of algae the iguana grazes.',
      ),
      citations: ['vinueza-2006', 'laurie-1990-enso'],
    },
    lower: {
      physical: copy(
        'Menos fitoplancton superficial; el sistema pelágico muestra menor producción en la superficie.',
        'Less surface phytoplankton; the pelagic system shows lower surface production.',
      ),
      food: copy(
        'De nuevo, este indicador no describe las algas del fondo. La dieta y la condición corporal de la iguana se comprueban en el litoral, no con la clorofila.',
        'Again, this indicator does not describe bottom algae. The iguana’s diet and body condition are checked along the shore, not with chlorophyll.',
      ),
      mechanism: copy(
        'La conexión entre la producción pelágica y el pasto intermareal no está establecida para esta especie.',
        'The link between pelagic production and intertidal turf is not established for this species.',
      ),
      historic: copy(
        'Una menor clorofila superficial no permite deducir escasez de algas bentónicas en la orilla.',
        'Lower surface chlorophyll does not allow us to infer a shortage of benthic algae on the shore.',
      ),
      citations: ['vinueza-2006'],
    },
    near: {
      physical: copy(
        'Clorofila en su valor habitual; el plancton superficial se mantiene en su nivel estacional.',
        'Chlorophyll at its usual value; surface plankton stays at its seasonal level.',
      ),
      food: copy(
        'El pasto de algas de la orilla sigue respondiendo a factores locales: marea, oleaje, luz y herbivoría.',
        'Shore algal turf still responds to local factors: tide, waves, light and herbivory.',
      ),
      mechanism: copy(
        'Con la producción pelágica habitual, el alimento de la iguana lo determina el estado del intermareal, no el fitoplancton.',
        'With usual pelagic production, the iguana’s food is set by the state of the intertidal shore, not by phytoplankton.',
      ),
      historic: copy(
        'La clorofila próxima a la referencia no describe la orilla rocosa, que es donde se decide el alimento de la especie.',
        'Chlorophyll near the reference does not describe the rocky shore, which is where the species’ food is decided.',
      ),
      citations: ['vinueza-2006'],
    },
  },
  'Zalophus wollebaeki': {
    higher: {
      physical: copy(
        'Más fitoplancton en la superficie: mayor producción en la base de la red.',
        'More surface phytoplankton: higher production at the base of the web.',
      ),
      food: copy(
        'Esa producción llega a sus presas a través de varios pasos tróficos; no hay una equivalencia directa entre más clorofila y más peces.',
        'That production reaches its prey through several trophic steps; there is no direct equivalence between more chlorophyll and more fish.',
      ),
      mechanism: copy(
        'Para vincular la clorofila con el aprovisionamiento de las crías harían falta datos de los peces realmente consumidos.',
        'Linking chlorophyll to pup provisioning would require data on the fish actually eaten.',
      ),
      historic: copy(
        'Más clorofila no significa automáticamente mejor supervivencia: el estudio de 2015 no encontró correlación significativa entre sus indicadores y las crías censadas.',
        'More chlorophyll does not automatically mean better survival: the 2015 study found no significant correlation between its indicators and pup counts.',
      ),
      citations: ['trillmich-limberger-1985', 'paez-rosas-2021'],
    },
    lower: {
      physical: copy(
        'Menos fitoplancton superficial: menor producción primaria en la región.',
        'Less surface phytoplankton: lower primary production across the region.',
      ),
      food: copy(
        'Una base productiva menor puede reducir la biomasa de sus presas. En 2015 el estudio midió clorofila integrada en profundidad y no halló correlación significativa con las crías.',
        'A smaller productive base can reduce prey biomass. In 2015 the study measured depth-integrated chlorophyll and found no significant correlation with pup counts.',
      ),
      mechanism: copy(
        'La ausencia de correlación no niega el mecanismo, pero muestra que la relación no es simple ni se detecta con un solo indicador superficial.',
        'The lack of correlation does not deny the mechanism, but it shows the relationship is not simple and is not detected with a single surface indicator.',
      ),
      historic: copy(
        'Una menor clorofila no equivale a un colapso de la productividad ni a una predicción de mortalidad.',
        'Lower chlorophyll does not equal a collapse in productivity or a prediction of mortality.',
      ),
      citations: ['paez-rosas-2021'],
    },
    near: {
      physical: copy(
        'Clorofila en su valor habitual; producción primaria dentro de la variación normal.',
        'Chlorophyll at its usual value; primary production within normal variation.',
      ),
      food: copy(
        'Con la producción habitual, la distribución de presas responde a procesos locales, no solo al plancton.',
        'With usual production, prey distribution responds to local processes, not only to plankton.',
      ),
      mechanism: copy(
        'El funcionamiento habitual: el lobo marino busca presas en aguas costeras y regresa a amamantar.',
        'Business as usual: the sea lion seeks prey in coastal water and returns to nurse.',
      ),
      historic: copy(
        'La producción próxima a la referencia no informa por sí sola sobre cuántas madres hay en el mar ni sobre la supervivencia de las crías.',
        'Production near the reference says nothing on its own about how many mothers are at sea or about pup survival.',
      ),
      citations: ['trillmich-limberger-1985'],
    },
  },
  'Nannopterum harrisi': {
    higher: {
      physical: copy(
        'Más fitoplancton superficial; es contexto del sistema, no una medida de los peces de fondo.',
        'More surface phytoplankton; this is context for the system, not a measure of bottom fish.',
      ),
      food: copy(
        'El cormorán captura presas cerca del fondo; harían falta censos de peces en sus zonas de buceo para saber si el alimento cambia.',
        'The cormorant takes prey near the seabed; fish surveys in its diving grounds would be needed to know whether food changes.',
      ),
      mechanism: copy(
        'La clorofila describe la superficie; el efecto sobre las presas del fondo debe comprobarse localmente.',
        'Chlorophyll describes the surface; the effect on bottom prey must be verified locally.',
      ),
      historic: copy(
        'No está establecido que un aumento de clorofila superficial implique más peces de fondo en las aguas someras del cormorán.',
        'It is not established that a rise in surface chlorophyll implies more bottom fish in the cormorant’s shallow water.',
      ),
      citations: ['tindle-2013'],
    },
    lower: {
      physical: copy(
        'Menos fitoplancton superficial.',
        'Less surface phytoplankton.',
      ),
      food: copy(
        'Con menos producción superficial, la pregunta es si cambia el alimento cerca del fondo en los tramos usados para criar.',
        'With less surface production, the question is whether food near the seabed changes along breeding shores.',
      ),
      mechanism: copy(
        'No está establecido que la clorofila superficial refleje el alimento de fondo del cormorán.',
        'It is not established that surface chlorophyll reflects the cormorant’s bottom food.',
      ),
      historic: copy(
        'Una menor clorofila superficial no permite deducir escasez de presas en el fondo.',
        'Lower surface chlorophyll does not allow us to infer a shortage of bottom prey.',
      ),
      citations: ['tindle-2013'],
    },
    near: {
      physical: copy(
        'Clorofila en su valor habitual.',
        'Chlorophyll at its usual value.',
      ),
      food: copy(
        'El alimento del cormorán depende de procesos locales del fondo, no del valor medio de la clorofila.',
        'The cormorant’s food depends on local bottom processes, not on the mean chlorophyll value.',
      ),
      mechanism: copy(
        'El funcionamiento habitual de su zona de buceo costera.',
        'The usual working of its coastal diving ground.',
      ),
      historic: copy(
        'El promedio de clorofila de la región aporta poco contexto sobre un tramo corto de costa.',
        'The region’s mean chlorophyll gives little context about a short stretch of coast.',
      ),
      citations: ['tindle-2013'],
    },
  },
  'Arctocephalus galapagoensis': {
    higher: {
      physical: copy(
        'Más fitoplancton superficial.',
        'More surface phytoplankton.',
      ),
      food: copy(
        'El fitoplancton está varios pasos tróficos por debajo de sus presas; el aumento no se traduce directamente en más alimento.',
        'Phytoplankton is several trophic steps below its prey; the increase does not translate directly into more food.',
      ),
      mechanism: copy(
        'Vincular la clorofila con la lactancia exige seguir a las madres y medir los intervalos entre tomas.',
        'Linking chlorophyll to nursing requires following mothers and measuring intervals between visits.',
      ),
      historic: copy(
        'No hay mediciones que conecten la clorofila superficial con la condición de las crías.',
        'No measurements connect surface chlorophyll with pup condition.',
      ),
      citations: ['fur-diet'],
    },
    lower: {
      physical: copy(
        'Menos fitoplancton superficial.',
        'Less surface phytoplankton.',
      ),
      food: copy(
        'Una base productiva menor motiva examinar las presas pelágicas y mesopelágicas; la duración de los viajes y la condición de las crías se miden por separado.',
        'A smaller productive base motivates sampling pelagic and midwater prey; trip duration and pup condition are measured separately.',
      ),
      mechanism: copy(
        'El estudio de 2015 no encontró correlación significativa entre las condiciones oceanográficas y las crías censadas por región.',
        'The 2015 study found no significant correlation between ocean conditions and pup counts by region.',
      ),
      historic: copy(
        'Una menor clorofila no predice por sí sola pérdidas de crías.',
        'Lower chlorophyll does not by itself predict pup losses.',
      ),
      citations: ['paez-rosas-2021'],
    },
    near: {
      physical: copy(
        'Clorofila en su valor habitual.',
        'Chlorophyll at its usual value.',
      ),
      food: copy(
        'Con la producción habitual, el factor decisivo es la accesibilidad nocturna de las presas a profundidad.',
        'With usual production, the decisive factor is the nocturnal accessibility of prey at depth.',
      ),
      mechanism: copy(
        'El funcionamiento habitual de sus viajes de alimentación.',
        'The usual working of its feeding trips.',
      ),
      historic: copy(
        'La clorofila superficial no informa sobre la distribución nocturna de las presas mesopelágicas.',
        'Surface chlorophyll says nothing about the nocturnal distribution of midwater prey.',
      ),
      citations: ['fur-diet', 'trillmich-limberger-1985'],
    },
  },
}

/**
 * Contexto de la especie que no depende del escenario seleccionado.
 * Cubre los puntos 5, 6 y 8: otros organismos implicados, repercusión sobre el
 * hábitat y lo que todavía no se ha demostrado.
 */
export interface EcosystemCore {
  /** 5. Qué otros organismos participan en la interacción. */
  community: LocalizedText
  /** 6. Cómo puede repercutir una alteración sobre el hábitat. */
  habitatEffect: LocalizedText
  /** 8. Qué todavía no se ha demostrado. */
  unknown: LocalizedText
  citations: string[]
}

export const ecosystemCore: Record<SpeciesId, EcosystemCore> = {
  'Spheniscus mendiculus': {
    community: copy(
      'El pingüino ocupa una posición intermedia-alta en la red costera: consume peces pequeños y compite por ellos con otras aves marinas y con peces depredadores.',
      'The penguin occupies a mid-to-high position in the coastal web: it eats small fish and competes for them with other seabirds and with predatory fish.',
    ),
    habitatEffect: copy(
      'Su presencia conecta la costa volcánica con el océano: nidifica en grietas de lava y se alimenta en aguas cercanas, de modo que cualquier cambio en los cardúmenes se refleja en el uso del litoral.',
      'Its presence links the volcanic shore with the ocean: it nests in lava crevices and feeds in nearby water, so any change in fish schools shows up in its use of the shoreline.',
    ),
    unknown: copy(
      'No se ha medido cómo responde la población de presas al descenso del pingüino, ni si el ave controla a los peces o solo los sigue.',
      'It has not been measured how prey populations respond to the penguin’s decline, nor whether the bird controls the fish or simply follows them.',
    ),
    citations: ['boersma-1998', 'vargas-2006', 'valle-1987-condor'],
  },
  'Amblyrhynchus cristatus': {
    community: copy(
      'La iguana comparte la orilla con otros herbívoros: cangrejos y peces que pastan algas. En un experimento de exclusión en dos costas de Santa Cruz, los herbívoros influyeron en el tamaño de las algas en el pico de El Niño 1997–1998 y tuvieron poco efecto en su cobertura; después del episodio, en uno de los sitios solo la acción conjunta de todos los herbívoros redujo las algas erectas.',
      'The iguana shares the shore with other grazers: crabs and algae-grazing fish. In an exclusion experiment on two Santa Cruz shores, grazers influenced algal size at the peak of the 1997–1998 El Niño but had little effect on cover; after the event, at one site only all grazers acting together reduced erect algae.',
    ),
    habitatEffect: copy(
      'La herbivoría moldea la comunidad rocosa: al consumir algas, las iguanas y los demás herbívoros influyen en qué especies dominan la orilla. El experimento muestra que ese control es compartido y depende del momento y del sitio, no de la iguana sola.',
      'Herbivory shapes the rocky community: by consuming algae, iguanas and the other grazers influence which species dominate the shore. The experiment shows that this control is shared and depends on timing and site, not on iguanas alone.',
    ),
    unknown: copy(
      'El experimento no atribuye la respuesta de toda la comunidad a la iguana por sí sola, y no mide cómo cambiaría la orilla si la población de iguanas se redujera de forma prolongada.',
      'The experiment does not attribute the whole community response to iguanas alone, and it does not measure how the shore would change if the iguana population declined for a long period.',
    ),
    citations: ['vinueza-2006', 'laurie-brown-1990', 'laurie-1990-enso', 'romero-wikelski-2001'],
  },
  'Zalophus wollebaeki': {
    community: copy(
      'El lobo marino es un depredador marino que consume peces y cefalópodos; comparte esas presas con otros consumidores, como aves marinas, peces grandes y el lobo peletero.',
      'The sea lion is a marine predator eating fish and cephalopods; it shares those prey with other consumers, such as seabirds, large fish and the fur seal.',
    ),
    habitatEffect: copy(
      'Como consumidor, su presencia conecta el mar con la costa: transporta energía del océano a la colonia y mantiene el flujo entre ambos ambientes.',
      'As a consumer, its presence links sea and shore: it carries energy from the ocean to the colony and keeps the flow between both environments.',
    ),
    unknown: copy(
      'No se ha medido si el lobo marino controla la abundancia de sus presas o si solo responde a ella; los censos no separan mortalidad de cambios de asistencia a las colonias.',
      'It has not been measured whether the sea lion controls prey abundance or simply responds to it; counts do not separate mortality from changes in colony attendance.',
    ),
    citations: ['trillmich-limberger-1985', 'paez-rosas-2021', 'fur-diet'],
  },
  'Nannopterum harrisi': {
    community: copy(
      'El cormorán es un consumidor costero que captura peces y otras presas cerca del fondo, en aguas someras próximas a su colonia.',
      'The cormorant is a coastal consumer taking fish and other prey near the seabed, in shallow water close to its colony.',
    ),
    habitatEffect: copy(
      'Como depredador costero, forma parte de la comunidad marina local de Isabela y Fernandina; su dependencia de presas cercanas al fondo lo vincula al estado de esos hábitats someros.',
      'As a coastal predator, it is part of the local marine community of Isabela and Fernandina; its dependence on bottom prey links it to the state of those shallow habitats.',
    ),
    unknown: copy(
      'La disponibilidad de presas es un mecanismo propuesto, pero el estudio no cuantificó una cascada sobre el fondo marino.',
      'Prey availability is a proposed mechanism, but the study did not quantify a cascade on the seabed.',
    ),
    citations: ['tindle-2013', 'valle-1987-condor'],
  },
  'Arctocephalus galapagoensis': {
    community: copy(
      'El lobo peletero es un depredador marino que consume peces y calamares, con predominio de peces mesopelágicos en las muestras de heces. Coexiste con el lobo marino, que usa presas más costeras.',
      'The fur seal is a marine predator eating fish and squid, with midwater fish predominating in scat samples. It coexists with the sea lion, which uses more coastal prey.',
    ),
    habitatEffect: copy(
      'Como consumidor de presas mesopelágicas, su actividad conecta la superficie, donde respira y cría, con la columna de agua profunda donde se alimenta.',
      'As a consumer of midwater prey, its activity links the surface, where it breathes and breeds, with the deep water column where it feeds.',
    ),
    unknown: copy(
      'La densidad de presas en cada inmersión y cómo una caída de la población afectaría a esas presas mesopelágicas no se han medido.',
      'Prey density on each dive and how a population decline would affect those midwater prey have not been measured.',
    ),
    citations: ['trillmich-limberger-1985', 'paez-rosas-2021', 'fur-diet'],
  },
}
