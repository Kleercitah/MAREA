export type ThermalScenario = 'warming' | 'cooling' | 'near'
export type ProductivityScenario = 'higher' | 'lower' | 'near'

/** Orden de presentación de los controles: el extremo cálido primero, la referencia al centro. */
export const thermalOrder: ThermalScenario[] = ['warming', 'near', 'cooling']
export const productivityOrder: ProductivityScenario[] = ['higher', 'near', 'lower']

/** ¿Qué ejes del escenario resalta cada elemento del ecosistema? */
export type ScenarioAxis = ThermalScenario | ProductivityScenario

export function axisOf(thermal: ThermalScenario, productivity: ProductivityScenario): ScenarioAxis[] {
  const axes: ScenarioAxis[] = []
  if (thermal !== 'near') axes.push(thermal)
  if (productivity !== 'near') axes.push(productivity)
  return axes
}
