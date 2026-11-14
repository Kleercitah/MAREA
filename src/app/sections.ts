export const sections = [
  { id: 'home', path: '/' },
  { id: 'ocean', path: '/ocean-explorer' },
  { id: 'trends', path: '/climate-detective' },
  { id: 'species', path: '/marine-life' },
  { id: 'signals', path: '/habitat-signals' },
  { id: 'timeline', path: '/el-nino-timeline' },
  { id: 'report', path: '/scientific-report' },
] as const

export type SectionId = (typeof sections)[number]['id']
export const modules = sections.filter(section => section.id !== 'home')
