import type { LocalizedText, SpeciesId } from '../../data/contracts'

interface BiologicalEvidence {
  period: string
  observed: LocalizedText
  source: string
  ecosystem: LocalizedText
  ecosystemSource: string
  uncertainty: LocalizedText
}

export const biologicalEvidence: Record<SpeciesId, BiologicalEvidence> = {
  'Spheniscus mendiculus': {
    period: '1982–1983',
    observed: { es: 'En las costas censadas de Isabela y Fernandina se contaron 1716 pingüinos en 1980 y 398 en 1983, un descenso del 77 %.',
      en: 'Surveys along Isabela and Fernandina counted 1,716 penguins in 1980 and 398 in 1983, a 77% decline.' },
    source: 'valle-1987-condor',
    ecosystem: { es: 'Captura peces de cardumen en aguas costeras. Tras El Niño, los censos registraron escaso reclutamiento de juveniles.',
      en: 'It catches schooling fish in coastal waters. After El Niño, surveys documented low juvenile recruitment.' },
    ecosystemSource:'valle-1987-condor',
    uncertainty: {es:'Los recuentos de aves no permiten cuantificar cambios en las poblaciones de peces.',en:'Bird counts cannot quantify changes in fish populations.'},
  },
  'Amblyrhynchus cristatus': {
    period: '1982–1983',
    observed: {es:'En Santa Fe, el seguimiento por marcaje, recaptura y reavistamiento estimó una mortalidad por inanición del 60–70 % durante El Niño.',
      en:'On Santa Fe, marking, recapture and resighting yielded an estimated 60–70% mortality from starvation during El Niño.'},
    source:'laurie-brown-1990',
    ecosystem:{es:'La iguana pasta algas bentónicas. En dos costas rocosas de Santa Cruz, un experimento de exclusión de iguanas, cangrejos y peces mostró que, en el pico de El Niño 1997–1998, los herbívoros influyeron en el tamaño de las algas y tuvieron poco efecto en su cobertura. Después del episodio, en uno de los sitios solo la acción conjunta de los herbívoros redujo las algas erectas.',
      en:'Iguanas graze benthic algae. At two rocky shores on Santa Cruz, experimental exclusions of iguanas, crabs and fish showed that grazers influenced algal size but had little effect on algal cover at the peak of the 1997–1998 El Niño. After the event, only the grazers acting together reduced erect algae at one of the sites.'},
    ecosystemSource:'vinueza-2006',
    uncertainty:{es:'Ese experimento no atribuye la respuesta de toda la comunidad a la iguana por sí sola.',en:'The experiment does not attribute the whole community response to iguanas alone.'},
  },
  'Zalophus wollebaeki': {
    period:'2014–2015',
    observed:{es:'En 32 colonias reproductivas de 13 islas, el número de lobos marinos contados disminuyó un 23,9 % respecto a 2014. El resumen del artículo comunica un 23,8 %.',
      en:'Across 32 breeding colonies on 13 islands, sea lion counts fell 23.9% relative to 2014. The paper’s abstract reports 23.8%.'},
    source:'paez-rosas-2021',
    ecosystem:{es:'Consume peces y cefalópodos. La madre alterna viajes de alimentación y lactancia en tierra, lo que vincula el acceso a presas con la crianza.',
      en:'It consumes fish and cephalopods. Mothers alternate feeding trips with nursing on land, linking access to prey with pup rearing.'},
    ecosystemSource:'trillmich-limberger-1985',
    uncertainty:{es:'La asistencia a las colonias influye en los censos. Estos no permiten atribuir el descenso a muertes individuales ni medir un efecto sobre las presas.',
      en:'Attendance at colonies affects counts. These surveys do not establish individual deaths or a change in prey populations.'},
  },
  'Nannopterum harrisi': {
    period:'1982–1983',
    observed:{es:'En las costas de Isabela y Fernandina se contaron 802 cormoranes en 1980 y 409 en 1983, un descenso del 49 %.',
      en:'Coastal surveys on Isabela and Fernandina counted 802 cormorants in 1980 and 409 in 1983, a 49% decline.'},
    source:'valle-1987-condor',
    ecosystem:{es:'Busca peces cerca del fondo al bucear junto a su colonia. En una colonia estudiada durante diez años, la persistencia de aguas frías se asoció con más puestas y más juveniles que completaron la crianza.',
      en:'It dives for fish near the seabed close to its colony. In a ten-year colony study, persistent cool water was associated with more clutches and more fledged young.'},
    ecosystemSource:'tindle-2013',
    uncertainty:{es:'La disponibilidad de presas es un mecanismo propuesto. El estudio no cuantificó una cascada sobre el fondo marino.',
      en:'Prey availability is a proposed mechanism. The study did not quantify a cascade on the seabed.'},
  },
  'Arctocephalus galapagoensis': {
    period:'2014–2015',
    observed:{es:'En 11 colonias reproductivas de siete islas, el número de lobos peleteros contados en 2015 cayó un 38,1 % respecto a 2014.',
      en:'Across 11 breeding colonies on seven islands, the number of fur seals counted in 2015 fell 38.1% relative to 2014.'},
    source:'paez-rosas-2021',
    ecosystem:{es:'Consume peces y calamares. En las colonias estudiadas durante El Niño de 1982–1983, la escasez de alimento coincidió con pérdidas de crías que aún dependían de la madre.',
      en:'It eats fish and squid. In colonies studied during the 1982–1983 El Niño, food scarcity coincided with losses of young still dependent on their mothers.'},
    ecosystemSource:'trillmich-limberger-1985',
    uncertainty:{es:'El recuento de 2015 no permite repartir el descenso entre cambios de asistencia y mortalidad ni deducir cambios en los bancos de peces.',
      en:'The 2015 counts cannot distinguish changes in attendance from mortality or establish changes in fish schools.'},
  },
}
