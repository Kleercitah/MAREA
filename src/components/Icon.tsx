import type { SectionId } from '../app/sections'

type IconName = Exclude<SectionId, 'home'> | 'arrow' | 'menu' | 'close' | 'pin'
const paths: Record<IconName, string> = {
  ocean: 'M2 8q3-4 6 0t6 0t6 0 M2 13q3-4 6 0t6 0t6 0 M2 18q3-4 6 0t6 0t6 0',
  trends: 'M3 3v17h18 M6 15l4-6 4 3 6-8',
  species: 'M3 12q7-10 15 0-8 10-15 0z M17 12l5-5v10z M7 11h.1',
  signals: 'M2 12h4l3-7 4 14 3-7h6',
  timeline: 'M3 7h18 M3 17h18 M7 4v6 M16 14v6',
  report: 'M6 2h8l5 5v15H6z M14 2v6h5 M9 12h7 M9 16h7',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  menu: 'M3 6h18 M3 12h18 M3 18h18',
  close: 'M5 5l14 14 M19 5 5 19',
  pin: 'M12 21s7-7.6 7-12a7 7 0 0 0-14 0c0 4.4 7 12 7 12z M14 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0',
}

export function Icon({ name }: { name: IconName }) {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round">
    <path d={paths[name]} />
  </svg>
}
