import type { SpeciesId } from '../../data/contracts'
import { publicUrl } from '../../public-url'

/**
 * Registro central de los modelos 3D de vida marina.
 *
 * Relaciona el identificador científico de cada especie con la ruta del archivo
 * GLB dentro del proyecto. Los componentes nunca escriben rutas sueltas:
 * consultan este registro, de modo que sustituir un modelo por una versión
 * revisada solo exige cambiar el nombre del archivo.
 *
 * Los cinco modelos de Tripo están publicados en
 * public/art/species/models/ y se sirven bajo demanda: el motor 3D y el archivo
 * solo se descargan cuando la persona elige la vista «Modelo».
 */
export interface SpeciesModel {
  /** Nombre del archivo dentro de public/art/species/models/. */
  file: string
  /** Ruta pública que sirve el archivo. */
  path: string
  /** ¿Existe el archivo real? Si es falso, la interfaz muestra «En preparación». */
  available: boolean
}

const model = (file: string): SpeciesModel => ({
  file,
  path: publicUrl('/art/species/models/' + file),
  available: true,
})

export const speciesModels: Record<SpeciesId, SpeciesModel> = {
  'Spheniscus mendiculus': model('spheniscus-mendiculus.glb'),
  'Amblyrhynchus cristatus': model('amblyrhynchus-cristatus.glb'),
  'Zalophus wollebaeki': model('zalophus-wollebaeki.glb'),
  'Nannopterum harrisi': model('nannopterum-harrisi.glb'),
  'Arctocephalus galapagoensis': model('arctocephalus-galapagoensis.glb'),
}
