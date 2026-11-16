import { useLanguage } from '../i18n/Language'
import type { OceanVariable } from '../features/ocean/data'

export function ScienceContext({variable, includeEnso = true}: {variable: OceanVariable; includeEnso?: boolean}) {
  const {language} = useLanguage()
  const es = language === 'es'
  return <details className="science-context">
    <summary>{variable === 'chlorophyll-a'
      ? (es ? 'Qué mide la clorofila-a' : 'What chlorophyll-a measures')
      : (es ? 'Temperatura superficial y fisiología' : 'Surface temperature and physiology')}</summary>
    {variable === 'chlorophyll-a' ? <p>{es
      ? 'La clorofila-a es un pigmento del fitoplancton que capta luz para la fotosíntesis. Su concentración superficial aproxima la abundancia de fitoplancton, aunque el pigmento por célula varía. Medir producción primaria total, nutrientes, algas del fondo o alimento para una especie requiere otros datos.'
      : 'Chlorophyll-a is a phytoplankton pigment that captures light for photosynthesis. Its surface concentration is a proxy for phytoplankton abundance, although pigment per cell varies. Total primary production, nutrients, bottom-dwelling algae and food available to a species require other measurements.'}
      {' '}<a href="https://ntrs.nasa.gov/citations/20150000711">NASA · SeaWiFS ↗</a></p>
    : <p>{es
      ? 'En animales marinos, el calor puede alterar las membranas y el metabolismo celular. Las proteínas de choque térmico ayudan a proteger otras proteínas. La tolerancia depende de la especie y de su historia térmica. La SST describe el agua; detectar estas respuestas en animales de Galápagos requiere mediciones biológicas.'
      : 'In marine animals, heat can alter membranes and cellular metabolism. Heat-shock proteins help protect other proteins. Tolerance depends on the species and its thermal history. SST describes the water. Detecting these responses in Galápagos animals requires biological measurements.'}
      {' '}<a href="https://pubmed.ncbi.nlm.nih.gov/11707506/">Buckley et al. ↗</a>{' · '}
      <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC5936721/">{es ? 'Tolerancia térmica' : 'Thermal tolerance'} ↗</a></p>}
    {includeEnso && <p>{es
      ? 'Durante El Niño, el calentamiento y los cambios en el afloramiento pueden reducir el aporte de nutrientes a la superficie. El fitoplancton responde y puede cambiar la red alimentaria. La respuesta varía según la zona, la estación y las especies.'
      : 'During El Niño, warming and changes in upwelling can reduce nutrient delivery to the surface. Phytoplankton respond, with possible effects on food webs. Responses vary by location, season and species.'}
      {' '}<a href="https://science.nasa.gov/earth/earth-observatory/el-nino-alters-marine-life-in-the-pacific/">NASA ↗</a>{' · '}
      <a href="https://pubmed.ncbi.nlm.nih.gov/34921709/">Galápagos 2015–2016 ↗</a></p>}
  </details>
}
