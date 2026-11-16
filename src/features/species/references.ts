/**
 * Referencias científicas verificadas de las fichas de vida marina.
 * Los textos y las fuentes se mantienen fuera de los componentes para poder
 * actualizarlos sin tocar la interfaz.
 */

export interface Citation {
  /** Referencia bibliográfica completa, igual para ambos idiomas. */
  text: string
  /** Enlace consultable al documento original, cuando existe uno estable. */
  url?: string
}

export const citations: Record<string, Citation> = {
  'valle-1987-jgr': {
    text: 'Valle, C. A., et al. (1987). The impact of the 1982–1983 El Niño-Southern Oscillation on seabirds in the Galapagos Islands, Ecuador. Journal of Geophysical Research: Oceans, 92(C13), 14437–14444.',
    url: 'https://doi.org/10.1029/JC092iC13p14437',
  },
  'valle-1987-condor': {
    text: 'Valle, C. A., & Coulter, M. C. (1987). Present status of the flightless cormorant, Galapagos penguin and greater flamingo populations in the Galapagos Islands, Ecuador, after the 1982–83 El Niño. The Condor, 89, 276–281.',
    url: 'https://doi.org/10.2307/1368480',
  },
  'boersma-1998': {
    text: 'Boersma, P. D. (1998). Population trends of the Galápagos penguin: impacts of El Niño and La Niña. The Condor, 100(2), 245–253.',
    url: 'https://doi.org/10.2307/1370265',
  },
  'vargas-2006': {
    text: 'Vargas, F. H., et al. (2006). Biological effects of El Niño on the Galápagos penguin. Biological Conservation, 127(1), 107–114.',
    url: 'https://doi.org/10.1016/j.biocon.2005.08.001',
  },
  'karnauskas-2015': {
    text: 'Karnauskas, K. B., et al. (2015). Strong sea surface cooling in the eastern equatorial Pacific and implications for Galápagos penguin conservation. Geophysical Research Letters, 42(15), 6432–6437.',
    url: 'https://doi.org/10.1002/2015GL064456',
  },
  'bollmer-2007': {
    text: 'Bollmer, J. L., et al. (2007). Low MHC variation in the endangered Galápagos penguin (Spheniscus mendiculus). Immunogenetics, 59(7), 593–602.',
    url: 'https://doi.org/10.1007/s00251-007-0221-y',
  },
  'arauco-shapiro-2020': {
    text: 'Arauco-Shapiro, G., et al. (2020). The role of demographic history and selection in shaping genetic diversity of the Galápagos penguin (Spheniscus mendiculus). PLoS ONE, 15(1), e0226439.',
    url: 'https://doi.org/10.1371/journal.pone.0226439',
  },
  'wikelski-thom-2000': {
    text: 'Wikelski, M., & Thom, C. (2000). Marine iguanas shrink to survive El Niño. Nature, 403, 37–38.',
    url: 'https://doi.org/10.1038/47396',
  },
  'romero-wikelski-2001': {
    text: 'Romero, L. M., & Wikelski, M. (2001). Corticosterone levels predict survival probabilities of Galápagos marine iguanas during El Niño events. Proceedings of the National Academy of Sciences, 98(13), 7366–7370.',
    url: 'https://doi.org/10.1073/pnas.131091498',
  },
  'wikelski-1997': {
    text: 'Wikelski, M., et al. (1997). Energy limits to body size in a grazing reptile, the Galapagos marine iguana. Ecology, 78(7), 2204–2217.',
    url: 'https://doi.org/10.1890/0012-9658(1997)078[2204:ELTBSI]2.0.CO;2',
  },
  'steinfartz-2007': {
    text: 'Steinfartz, S., et al. (2007). Genetic impact of a severe El Niño event on Galápagos marine iguanas (Amblyrhynchus cristatus). PLoS ONE, 2(12), e1285.',
    url: 'https://doi.org/10.1371/journal.pone.0001285',
  },
  'macleod-2015': {
    text: 'MacLeod, A., et al. (2015). Hybridization masks speciation in the evolutionary history of the Galápagos marine iguana. Proceedings of the Royal Society B: Biological Sciences, 282, 20150425.',
    url: 'https://doi.org/10.1098/rspb.2015.0425',
  },
  'dubiner-2025': {
    text: 'Dubiner, S., et al. (2025). Marine iguanas have lower metabolic rates during El Niño. Journal of Experimental Biology, 228(17).',
    url: 'https://doi.org/10.1242/jeb.250907',
  },
  'trillmich-limberger-1985': {
    text: 'Trillmich, F., & Limberger, D. (1985). Drastic effects of El Niño on Galapagos pinnipeds. Oecologia, 67(1), 19–22.',
    url: 'https://doi.org/10.1007/BF00378445',
  },
  'paez-rosas-2021': {
    text: 'Páez-Rosas, D., et al. (2021). Declines and recovery in endangered Galapagos pinnipeds during the El Niño event. Scientific Reports, 11, 8785.',
    url: 'https://doi.org/10.1038/s41598-021-88350-0',
  },
  'riofrio-lazo-2017': {
    text: 'Riofrío-Lazo, M., et al. (2017). Population abundance of the endangered Galapagos sea lion Zalophus wollebaeki in the southeastern Galapagos archipelago. PLoS ONE, 12(1), e0168829.',
    url: 'https://doi.org/10.1371/journal.pone.0168829',
  },
  'wolf-2008': {
    text: 'Wolf, J. B. W., et al. (2008). Tracing early stages of species differentiation: ecological, morphological and genetic divergence of Galápagos sea lion populations. BMC Evolutionary Biology, 8, 150.',
    url: 'https://doi.org/10.1186/1471-2148-8-150',
  },
  'villegas-amtmann-2017': {
    text: 'Villegas-Amtmann, S., et al. (2017). Adapted to change: low energy requirements in a low and unpredictable productivity environment, the case of the Galapagos sea lion. Deep Sea Research Part II: Topical Studies in Oceanography, 140, 94–104.',
    url: 'https://doi.org/10.1016/j.dsr2.2016.05.015',
  },
  'villegas-amtmann-costa-2010': {
    text: 'Villegas-Amtmann, S., & Costa, D. P. (2010). Oxygen stores plasticity linked to foraging behaviour and pregnancy in a diving predator, the Galapagos sea lion. Functional Ecology, 24(4), 785–795.',
    url: 'https://doi.org/10.1111/j.1365-2435.2009.01685.x',
  },
  'laurie-1990-enso': {
    text: 'Laurie, A. (1990). Effects of the 1982–83 El Niño-Southern Oscillation event on marine iguana populations on Galapagos. Elsevier Oceanography Series, 52, 361–380.',
    url: 'https://www.sciencedirect.com/science/article/abs/pii/S0422989408700412',
  },
  'laurie-brown-1990': {
    text:'Laurie, W. A., & Brown, D. (1990). Population biology of marine iguanas. II. Changes in annual survival rates and the effects of size, sex, age and fecundity in a population crash. Journal of Animal Ecology, 59, 529–544.',
    url:'https://library.iucn-isg.org/documents/1990/Laurie_1990_The_Journal_of_Animal_Ecology.pdf',
  },
  'vinueza-2006': {
    text:'Vinueza, L. R., et al. (2006). Top-down herbivory and bottom-up El Niño effects on Galápagos rocky-shore communities. Ecological Monographs, 76, 111–131.',
    url:'https://doi.org/10.1890/04-1957',
  },
  'tindle-2013': {
    text:'Tindle, R. W., et al. (2013). Population dynamics of the Galápagos Flightless Cormorant Phalacrocorax harrisi in relation to sea temperature. Marine Ornithology, 41, 121–133.',
    url:'https://nora.nerc.ac.uk/id/eprint/503253/',
  },
  'fur-diet': {
    text:'Dellinger, T., & Trillmich, F. (1999). Fish prey of the sympatric Galápagos fur seals and sea lions: seasonal variation and niche separation. Canadian Journal of Zoology.',
    url:'https://doi.org/10.1139/z99-095',
  },
  'worms': {
    text: 'WoRMS Editorial Board. World Register of Marine Species.',
    url: 'https://www.marinespecies.org/',
  },
}

export function citationList(ids: string[]): Citation[] {
  return ids.map(id => citations[id]).filter(Boolean)
}

/** Etiqueta corta (autor y año) para citar dentro de una sección sin repetir la ficha completa. */
export function citationLabel(id: string): string {
  if (id === 'valle-1987-condor') return 'Valle & Coulter 1987'
  if (id === 'laurie-brown-1990') return 'Laurie & Brown 1990'
  const citation = citations[id]
  if (!citation) return id
  const match = citation.text.match(/^([^(]+?)\s*\((\d{4})\)/)
  if (match) return match[1].split(',')[0].trim() + ' ' + match[2]
  return citation.text.split('.')[0].trim()
}
