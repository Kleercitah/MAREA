import type { LocalizedText, SpeciesId } from '../../data/contracts'

const pair = (es: string, en: string): LocalizedText => ({ es, en })

interface FieldNote {
  title: LocalizedText
  text: LocalizedText
  source: string
}

const note = (title: LocalizedText, text: LocalizedText, source: string): FieldNote => ({ title, text, source })

interface FieldStory {
  magnitude: LocalizedText
  metric: LocalizedText
  area: LocalizedText
  history: FieldNote[]
  food: FieldNote
  response: FieldNote
  ocean: LocalizedText
  missing: LocalizedText
}

export const fieldStories: Record<SpeciesId, FieldStory> = {
  'Spheniscus mendiculus': {
    magnitude: pair('−77 %', '−77%'),
    metric: pair('Cambio en el recuento costero', 'Change in the coastal count'),
    area: pair('Isabela y Fernandina', 'Isabela and Fernandina'),
    history: [
      note(pair('1980 · Costa occidental', '1980 · Western coast'), pair('En los tramos de costa comparados se registraron 1716 individuos. Ese recuento es la referencia del descenso.', 'Observers recorded 1,716 individuals along the stretches of coast used for comparison. This count provides the baseline.'), 'valle-1987-condor'),
      note(pair('1983 · Después del calentamiento', '1983 · After the warming'), pair('El censo registró 398 aves. La escasez de juveniles indicó que pocos se habían incorporado a la población observada. Un ave ausente podía haber muerto o estar fuera del recorrido.', 'Observers counted 398 birds. Few were juveniles, indicating low recruitment into the population seen on the survey. A missing bird could have died or been outside the survey area.'), 'valle-1987-condor'),
      note(pair('1984 · Dos visitas', '1984 · Two visits'), pair('Se contaron 463 pingüinos en enero y 435 en agosto–septiembre. Ninguno de los dos censos alcanzó el nivel anterior al episodio.', 'Counts reached 463 in January and 435 in August–September. Both remained well below the pre-event count.'), 'valle-1987-condor'),
    ],
    food: note(pair('Peces de cardumen', 'Schooling fish'), pair('Los pingüinos capturan peces pequeños cerca de la costa. Si el afloramiento pierde intensidad, puede cambiar la distribución de los cardúmenes al alcance de una colonia.', 'Penguins catch small fish near shore. Weaker upwelling could redistribute schools within reach of a breeding colony.'), 'boersma-1998'),
    response: note(pair('Reclutamiento', 'Recruitment'), pair('El seguimiento costero distinguió juveniles y adultos. La escasez de juveniles tras el episodio limitó la recuperación incluso después de que disminuyera el calentamiento.', 'Coastal observers distinguished juveniles from adults. Low juvenile recruitment constrained recovery even after the warming subsided.'), 'valle-1987-condor'),
    ocean: pair('La SST y la clorofila-a permiten explorar episodios ENSO posteriores a 2003 en la zona de afloramiento occidental. El censo de 1983 precede a esas capas.', 'SST and chlorophyll-a show later ENSO episodes in the western upwelling zone. The 1983 survey predates these layers.'),
    missing: pair('Cruzar densidad de cardúmenes, viajes de adultos y éxito de nidos en las mismas colonias permitiría comprobar si el alimento limita la crianza.', 'Matched measurements of fish schools, adult trips and nest success could test whether food limits chick rearing.'),
  },
  'Amblyrhynchus cristatus': {
    magnitude: pair('60–70 %', '60–70%'),
    metric: pair('Mortalidad estimada en Santa Fe', 'Estimated mortality on Santa Fe'),
    area: pair('Santa Fe · litoral rocoso', 'Santa Fe · rocky intertidal'),
    history: [
      note(pair('1981 · Seguimiento individual', '1981 · Individual monitoring'), pair('El marcaje previo a El Niño permitió reconocer individuos, medir su tamaño y distinguir edades. Los reavistamientos sirvieron para estimar supervivencia.', 'Marking began before El Niño. Researchers could identify individuals, measure body size and distinguish age classes. Resightings provided survival estimates.'), 'laurie-brown-1990'),
      note(pair('1982–1983 · Cambio del pasto', '1982–1983 · A change in grazing habitat'), pair('Desaparecieron muchas de las algas preferidas y se extendió el alga parda Giffordia mitchelliae. Las pérdidas por inanición fueron especialmente intensas entre machos adultos y juveniles. Casi toda la cohorte nacida en 1982 desapareció.', 'Many preferred food algae disappeared and the brown alga Giffordia mitchelliae spread. Adult males and young iguanas suffered particularly heavy starvation losses. Nearly the entire 1982 hatchling cohort was lost.'), 'laurie-1990-enso'),
      note(pair('1983–1984 · Reproducción', '1983–1984 · Breeding'), pair('En la temporada siguiente casi no hubo reproducción en Santa Fe. El seguimiento posterior registró más hembras reproduciéndose y puestas mayores.', 'Breeding was rare on Santa Fe the following season. Later monitoring recorded more frequent breeding and larger clutches.'), 'laurie-1990-enso'),
    ],
    food: note(pair('Algas adheridas a roca', 'Algae growing on rock'), pair('El recurso medido en Santa Fe fue la composición del pasto intermareal. La proliferación de un alga parda coincidió con la pérdida del alimento habitual.', 'The food resource examined on Santa Fe was the composition of intertidal algal turf. A brown alga spread as familiar food species disappeared.'), 'laurie-1990-enso'),
    response: note(pair('Condición y supervivencia', 'Condition and survival'), pair('Al final de El Niño de 1998, en seis islas, las concentraciones de corticosterona se relacionaron con la condición corporal y permitieron predecir diferencias de supervivencia entre poblaciones. Las mediciones hormonales procedían de animales muestreados en campo.', 'At the end of the 1998 El Niño, corticosterone concentrations measured on six islands tracked body condition and predicted differences in survival among populations. The hormone measurements came from animals sampled in the field.'), 'romero-wikelski-2001'),
    ocean: pair('La SST sitúa el calentamiento y la clorofila-a describe el fitoplancton superficial. El pasto adherido a la roca responde también al oleaje, el afloramiento y la exposición de la costa.', 'SST places warming in context and chlorophyll-a describes surface phytoplankton. Algal turf on rock also responds to waves, upwelling and shore exposure.'),
    missing: pair('Para contrastar las capas de MAREA con la nutrición hacen falta parcelas intermareales, identificación de algas y seguimiento de condición corporal en las mismas fechas.', 'Testing a link with nutrition requires intertidal plots, identification of algae and body-condition measurements on matching dates.'),
  },
  'Zalophus wollebaeki': {
    magnitude: pair('−23,9 %', '−23.9%'),
    metric: pair('Cambio en animales censados', 'Change in animals counted'),
    area: pair('32 colonias de 13 islas', '32 colonies on 13 islands'),
    history: [
      note(pair('1983 · Crías de Santa Fe', '1983 · Santa Fe pups'), pair('Trillmich y Limberger recogen el seguimiento local de A. Laurie. De 140 crías, 19 sobrevivieron los primeros cinco meses. Se observó abandono e inanición. La cobertura de otras colonias fue menos sistemática.', 'Trillmich and Limberger report A. Laurie’s local observations. Of 140 pups, 19 survived their first five months. Abandonment and starvation were observed. Monitoring elsewhere was less systematic.'), 'trillmich-limberger-1985'),
      note(pair('2014–2015 · Animales en tierra', '2014–2015 · Animals ashore'), pair('La referencia fueron 4980 individuos contados en 2014 durante la época reproductiva. En 2015 se contaron menos. La asistencia a las colonias afecta a esta medida.', 'The baseline was 4,980 individuals counted during the 2014 breeding season. Fewer were ashore at the 2015 survey. Colony attendance affects this measure.'), 'paez-rosas-2021'),
      note(pair('2014–2016 · Crías censadas', '2014–2016 · Pup counts'), pair('En esas colonias el recuento específico de crías cayó un 40,5 % respecto a 2014. Esta comparación termina un año después que la de todas las edades y no estima supervivencia individual.', 'Across these colonies the pup count fell 40.5% relative to 2014. This comparison ends one year later than the all-age comparison and does not estimate individual survival.'), 'paez-rosas-2021'),
    ],
    food: note(pair('Peces costeros', 'Coastal fish'), pair('En las muestras de heces estudiadas, los otolitos de sardinas predominaban en el lobo marino. En el peletero predominaron peces de aguas más profundas. Los restos identifican presas consumidas en los sitios de muestreo.', 'Sardine ear bones predominated in the sea lion scats examined. Deep-water fishes predominated in fur seal samples. The remains identify prey consumed at the sampled sites.'), 'fur-diet'),
    response: note(pair('Crías en tierra', 'Pups ashore'), pair('Las crías dependen de la leche mientras la madre alterna viajes al mar y visitas a la colonia. En Santa Fe se observó pérdida de condición antes de la muerte de numerosas crías en 1983.', 'Pups rely on milk while mothers alternate time at sea with visits ashore. On Santa Fe, observers reported poor condition before many pups died in 1983.'), 'trillmich-limberger-1985'),
    ocean: pair('El episodio de 2015 está en las series de MAREA. El estudio de colonias midió también temperatura bajo la termoclina y clorofila integrada en profundidad. Sus correlaciones regionales con el número de crías no alcanzaron significancia.', 'The 2015 event falls within MAREA’s record. The colony study also measured subthermocline temperature and depth-integrated chlorophyll. Regional correlations with pup counts did not reach significance.'),
    missing: pair('Para atribuir el descenso a la alimentación se necesitan observaciones simultáneas de presas, asistencia de hembras y supervivencia de crías en cada colonia.', 'Attribution to feeding requires concurrent measurements of prey, maternal attendance and pup survival at each colony.'),
  },
  'Nannopterum harrisi': {
    magnitude: pair('−49 %', '−49%'),
    metric: pair('Cambio en el recuento costero', 'Change in the coastal count'),
    area: pair('Isabela y Fernandina', 'Isabela and Fernandina'),
    history: [
      note(pair('1980 · Costa de cría', '1980 · Breeding coast'), pair('Se contaron 802 cormoranes a lo largo de la costa de las dos islas que albergan la especie. Su fidelidad a tramos de litoral hace posible repetir el recorrido.', 'Observers counted 802 cormorants along the coasts of the two islands where the species lives. Fidelity to stretches of shore makes repeat coastal surveys possible.'), 'valle-1987-condor'),
      note(pair('1983 · Censo costero', '1983 · Coastal survey'), pair('Tras el episodio cálido se observaron 409 individuos. El censo registró aves presentes y no siguió el destino de cada adulto.', 'After the warm episode observers recorded 409 individuals. The survey counted birds present without following the fate of each adult.'), 'valle-1987-condor'),
      note(pair('1984 · Recuperación', '1984 · Recovery'), pair('Se contaron 637 aves en enero y 869 en agosto–septiembre, por encima de la referencia de 802 en 1980. Los pingüinos censados en esa misma costa todavía estaban por debajo de su referencia.', 'Observers counted 637 birds in January and 869 in August–September, above the 1980 baseline of 802. Penguins counted on the same coast were still below their baseline.'), 'valle-1987-condor'),
    ],
    food: note(pair('Presas del fondo', 'Prey near the seabed'), pair('Las aves bucean cerca de la colonia. En Punta Espinosa, la persistencia del agua fría en sus zonas de alimentación se asoció con la reproducción. Una mayor disponibilidad de presas es la explicación propuesta por los autores.', 'The birds dive close to the colony. At Punta Espinosa, persistent cool water on the foraging grounds was associated with breeding. The authors proposed greater prey availability as the explanation.'), 'tindle-2013'),
    response: note(pair('Puestas y juveniles', 'Clutches and fledglings'), pair('Entre 1970 y 1980, el seguimiento de nidos y aves anilladas en Punta Espinosa, Fernandina, registró más puestas y más jóvenes que completaron la crianza cuando persistía el agua fría. Los machos aportaron más material al nido y alimentaron más a las crías.', 'Between 1970 and 1980, nest observations and ringing at Punta Espinosa, Fernandina, recorded more clutches and fledglings when cool water persisted. Males contributed more to nest building and feeding young.'), 'tindle-2013'),
    ocean: pair('La SST y la clorofila-a permiten localizar la señal superficial del afloramiento occidental durante ENSO. Un promedio regional incluye aguas que los cormoranes nunca visitan.', 'SST and chlorophyll-a help locate the surface signature of western upwelling during ENSO. A regional mean includes water these birds never visit.'),
    missing: pair('Relacionar la superficie con el éxito de un nido requiere localizar inmersiones, muestrear peces de fondo y registrar el destino de las crías.', 'Linking surface conditions to nest success requires dive locations, surveys of bottom-dwelling fish and records of chick outcomes.'),
  },
  'Arctocephalus galapagoensis': {
    magnitude: pair('−38,1 %', '−38.1%'),
    metric: pair('Cambio en animales censados', 'Change in animals counted'),
    area: pair('11 colonias de siete islas', '11 colonies on seven islands'),
    history: [
      note(pair('1982 · Viajes maternos', '1982 · Mothers at sea'), pair('En Cabo Hammond, Fernandina, la mediana de los viajes de alimentación pasó de 1,3 días en 1979–1980 (131 viajes) a 3,5 en noviembre–diciembre de 1982 (54 viajes). La figura 1 mide ausencias de las madres.', 'At Cabo Hammond, Fernandina, the median feeding trip rose from 1.3 days in 1979–1980 (131 trips) to 3.5 days in November–December 1982 (54 trips). Figure 1 measures mothers’ absences.'), 'trillmich-limberger-1985'),
      note(pair('1982–1983 · Supervivencia local', '1982–1983 · Local survival'), pair('Ninguna de las 18 crías seguidas en Cabo Hammond a finales de 1982 sobrevivió sus primeros cinco meses. Los autores observaron desnutrición mientras se alargaban los intervalos entre visitas maternas.', 'None of the 18 pups followed at Cabo Hammond in late 1982 survived their first five months. Researchers observed undernutrition as intervals between mothers’ visits lengthened.'), 'trillmich-limberger-1985'),
      note(pair('2014–2016 · Censos de crías', '2014–2016 · Pup counts'), pair('En las 11 colonias, el recuento de crías cayó un 36,8 % de 2014 a 2015 y aumentó un 86,8 % de 2015 a 2016. Cada porcentaje usa como referencia el año inicial de su comparación.', 'Across the 11 colonies, pup counts fell 36.8% from 2014 to 2015 and rose 86.8% from 2015 to 2016. Each percentage uses the first year of its comparison as the baseline.'), 'paez-rosas-2021'),
    ],
    food: note(pair('Peces que ascienden de noche', 'Fish that rise at night'), pair('En las heces del peletero se identificaron sobre todo otolitos de peces linterna y otros peces mesopelágicos que ascienden de noche. Este uso de la columna de agua difiere del predominio de sardinas en las muestras de lobo marino.', 'Fur seal scats mainly contained ear bones from lanternfish and other midwater fishes that rise at night. Sardines predominated in the sea lion samples, indicating a different use of the water column.'), 'fur-diet'),
    response: note(pair('Intervalos de lactancia', 'Intervals between nursing visits'), pair('El seguimiento de hembras y crías en Cabo Hammond registró viajes maternos más largos durante el episodio y viajes más cortos después. Se midieron ausencias y supervivencia; la densidad de presas en cada inmersión queda por determinar.', 'Monitoring at Cabo Hammond recorded longer maternal trips during the episode and shorter trips afterwards. Researchers measured absences and survival. Prey density on individual dives remains unknown.'), 'trillmich-limberger-1985'),
    ocean: pair('En 2015 se pueden comparar la SST superficial de MAREA, la clorofila-a y la fase ENSO. Las correlaciones del estudio entre las condiciones oceanográficas y las crías censadas por región no fueron significativas.', 'For 2015, MAREA can compare surface temperature, chlorophyll-a and ENSO phase. Regional correlations between the study’s ocean measurements and pup counts were not significant.'),
    missing: pair('Para probar el mecanismo hacen falta perfiles de presas nocturnas, registros de buceo y medidas de lactancia y supervivencia en las mismas colonias y fechas.', 'Testing the mechanism requires nocturnal prey profiles, dive records, nursing observations and survival measurements from the same colonies and dates.'),
  },
}
