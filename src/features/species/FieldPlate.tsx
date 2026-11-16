import { useId } from 'react'
import type { SpeciesId } from '../../data/contracts'

const cyan = '#83E7FF'
const pink = '#E8A0FF'
const deep = '#07113D'
const light = '#d5f2fa'

/** Profiles face right so prey and feeding substrate can be placed at the snout. */
function Animal({ species }: { species: SpeciesId }) {
  if (species === 'Amblyrhynchus cristatus') return <g strokeLinejoin="round">
    <path fill="#607fa3" stroke={light} d="M3 89Q15 98 45 85Q75 66 105 75Q118 73 128 81L142 85Q151 87 147 96L135 99L124 94Q105 95 93 91Q76 95 57 89Q24 102 3 89Z"/>
    <path fill="#a7c7cf" d="m69 79 4-9 3 6 4-11 4 9 5-12 3 12 5-10 2 11 7-8 1 9 6-5 1 7z"/>
    <path d="m99 87 12 10-2 10 10 2m-42-22-9 12-13 2" fill="none" stroke="#a2bdcd" strokeWidth="5"/>
    <path d="m110 107 10-1m-9 2 9 3m-65-10-9 2m8-2-7-2" fill="none" stroke={light} strokeWidth="1.6"/>
    <circle cx="137" cy="88" r="2" fill={deep}/><path d="m138 96 8-2" stroke={deep}/>
  </g>
  if (species === 'Nannopterum harrisi') return <g>
    <path d="m13 73 32 4Q71 52 96 70Q107 78 112 93Q119 111 133 107Q142 103 151 114L171 121l-2 3-20-4Q139 123 129 120Q110 123 97 102L83 90Q59 97 38 85L14 82l14-3z" fill="#46698c" stroke={light} strokeWidth="1.5"/>
    <path d="M48 78Q69 67 86 76Q75 84 49 83Z" fill="#263b63"/><path d="m51 85-17 15-14-1 7-3-11-2 11-1 7 1 10-12" fill="#7789a1"/>
    <circle cx="143" cy="113" r="2" fill={cyan}/>
  </g>
  if (species === 'Spheniscus mendiculus') return <g transform="rotate(8 82 80)">
    <path d="m15 88 22-13Q65 49 95 58Q109 62 123 57Q138 51 148 63L166 67l-18 5Q135 85 112 91Q76 108 37 89l-22 3 8-7Z" fill="#203750" stroke={light} strokeWidth="1.5"/>
    <path d="M39 86Q74 90 102 76Q124 80 142 65Q137 80 115 88Q75 106 39 86" fill={light}/>
    <path d="M110 83q9-4 14-8l4 2-14 11z" fill={deep}/>
    <path d="M93 75Q84 93 58 112Q53 115 56 108l21-34" fill="#547d9a" stroke={light}/>
    <circle cx="140" cy="62" r="1.8" fill={light}/>
  </g>
  const fur = species === 'Arctocephalus galapagoensis'
  return <g>
    <path d={fur ? 'M12 88l19-11Q57 64 81 64Q111 67 121 53Q129 42 141 48l10 8 7 2q2 8-13 11Q130 72 117 84Q82 105 35 86L9 99l9-11-13 3z'
      : 'M6 90l25-13Q63 60 89 65Q117 66 130 52Q140 44 149 51l5 6 16 2q5 7-12 10Q142 69 128 82Q85 105 35 87L6 98l12-11z'} fill={fur ? '#877a91' : '#b79e90'} stroke={light} strokeWidth="1.5"/>
    <path d="M102 76Q96 94 65 114Q58 115 63 107l26-31" fill={fur ? '#635974' : '#887d8b'} stroke={light}/>
    <path d="m124 58 1-5 2 3m8 12 10-3" fill="none" stroke="#564d65" strokeWidth="2"/>
    <circle cx={fur ? 140 : 148} cy={fur ? 53 : 55} r="1.7" fill={deep}/>
  </g>
}

function Fish({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M0 0Q9-9 24-3l7-6-1 16-7-6Q10 7 0 0Z" fill={cyan}/>
    <path d="m11-4 5-5 3 5M11 3l4 4 2-4" fill="#71a8cb"/>
    <path d="M8-3q3 2 0 5" fill="none" stroke="#3470a3"/><circle cx="4" r="1.1" fill={deep}/>
  </g>
}

function Algae() {
  return <g fill="none" stroke="#87ddd3" strokeWidth="2.4" strokeLinecap="round">
    {[0, 1, 2, 3, 4].map(i => <g key={i} transform={`translate(${128+i*9} ${153-i*1.5}) scale(${0.7+(i%3)*0.15})`}>
      <path d="M0 0q-6-10-2-19m0 12-8-6m7 3 7-8M1 0q9-7 10-17m-6 12 10-4"/>
    </g>)}
  </g>
}

function Shore({ high = false }: { high?: boolean }) {
  return <g transform={high ? 'translate(0 -21)' : undefined}>
    <path d="m0 177 25-12 35 2 43-12 28 2 31-9 19 3 24-12 35 2v120H0z" fill="#42466c"/>
    <path d="m0 188 49-8 15 4 39-18 37-1 19-7 20 4 29-14 32 3M70 175l14 2 18-7m66-13 15-4" fill="none" stroke="#70809c" strokeWidth="1.5"/>
  </g>
}

/** A shore-to-offshore section separates the colony from the feeding habitat. */
function HabitatSection({ species }: { species: SpeciesId }) {
  const iguana = species === 'Amblyrhynchus cristatus'
  const pinniped = species === 'Zalophus wollebaeki' || species === 'Arctocephalus galapagoensis'
  return <g>
    <path d="M0 45l23-14 18 2 21 15 15 23 28 14 23 32 27 11 29 32 56 10v30H0Z" fill="#3c4361"/>
    <path d="m0 59 25-12 25 4 15 22m18 14 18 5 24 30 20 9m20 17 16 15 27 8" fill="none" stroke="#7b87a3"/>
    {iguana ? <>
      <g transform="translate(13 21) scale(.8) rotate(10 85 80)"><Animal species={species}/></g>
      <g transform="translate(0 -29) scale(.94)"><Algae/></g>
      <g transform="translate(179 63)" fill="none" stroke={cyan} strokeWidth="1.5">
        <ellipse rx="7" ry="3" transform="rotate(-20)"/><ellipse cx="17" cy="8" rx="4" ry="2"/>
        <path d="m-9 13 4-3 4 3-4 4zM20-7l4-4 4 3-3 5z"/>
      </g>
    </> : <>
      {pinniped && <g transform="translate(42 19) scale(-.33 .33)"><Animal species={species}/></g>}
      <g transform={species === 'Nannopterum harrisi' ? 'translate(85 32) scale(.70) rotate(20 85 86)' : 'translate(76 30) scale(.65) rotate(12 85 86)'}><Animal species={species}/></g>
      {[[165,127],[184,116],[196,132]].map(([x,y])=><Fish key={x} x={x} y={species === 'Spheniscus mendiculus' ? y-28 : y} scale={.58}/>)}
    </>}
    <path d="M228 162q-28-5-47-24t-33-44q-11-19-19-24m2 11-4-13 13 5" stroke={pink} strokeDasharray="5 4" strokeWidth="2" fill="none"/>
  </g>
}

function Helix() {
  const point = (y: number, side: number) => 120 + side * 50 * Math.cos((y-35)*Math.PI/72)
  const ys = Array.from({length:151}, (_,i) => i+35)
  return <g transform="rotate(17 120 110)" fill="none">
    {ys.filter((_,i)=>i%8===0).map(y=><line key={y} x1={point(y,1)} x2={point(y,-1)} y1={y} y2={y} stroke="#aab9de" strokeWidth="2"/>)}
    {[-1,1].map(side=><polyline key={side} points={ys.map(y=>point(y,side)+','+y).join(' ')} stroke={side===1?pink:cyan} strokeWidth="5" strokeLinecap="round"/>)}
  </g>
}

export function FieldPlate({ species, topic, label, es, magnitude }: {
  species: SpeciesId; topic: string; label: string; es: boolean; magnitude: string
}) {
  const id = useId()
  const iguana = species === 'Amblyrhynchus cristatus'
  const fur = species === 'Arctocephalus galapagoensis'
  const benthic = iguana || species === 'Nannopterum harrisi'
  const mechanism = topic === 'ecology' || topic === 'mechanism'
  const field = topic === 'sensitivity' || topic === 'genetics'
  const night = fur && !field
  const dry = topic === 'nursing' || (topic === 'physiology' && species !== 'Zalophus wollebaeki')
  const heading = topic === 'genetics' ? (es ? 'Doble hélice de ADN' : 'DNA double helix') : topic === 'sensitivity' ? (iguana ? (es ? 'Mortalidad estimada' : 'Estimated mortality') : (es ? 'Recuento de campo' : 'Field count'))
    : mechanism ? (es ? 'Surgencia y alimento' : 'Upwelling and food')
    : topic === 'observation' ? (es ? 'Superficie regional' : 'Regional surface')
    : topic === 'nursing' ? (es ? 'Lactancia en tierra' : 'Nursing ashore')
    : topic === 'physiology' ? (iguana ? (es ? 'Termorregulación' : 'Thermoregulation') : species === 'Zalophus wollebaeki' ? (es ? 'Buceo en apnea' : 'Breath-hold diving') : (es ? 'Masa corporal' : 'Body mass'))
    : iguana ? (es ? 'Pastoreo en roca' : 'Grazing on rock') : benthic ? (es ? 'Presas del fondo' : 'Benthic prey') : night ? (es ? 'Ascenso nocturno' : 'Night migration') : (es ? 'Presas costeras' : 'Coastal prey')
  const feeding = topic === 'diet'
  return <svg className="editorial-image" viewBox="0 0 240 240" role="img" aria-label={label}>
    <title>{label}</title>
    <defs><linearGradient id={id} x2=".62" y2="1">
      <stop stopColor={field ? '#26325b' : night ? '#26325c' : '#368ca5'}/>
      <stop offset=".42" stopColor={field || night ? '#19264b' : '#184b78'}/><stop offset="1" stopColor={deep}/>
    </linearGradient></defs>
    <rect width="240" height="240" fill={`url(#${id})`}/>
    {topic === 'genetics' ? <Helix/> : topic === 'sensitivity' ? <g>
      <path d="M22 61h196M22 175h196" stroke="#7787a8"/>
      <text x="120" y="134" textAnchor="middle" fill={pink} fontSize="45">{magnitude}</text>
    </g> : <>
      <path d="M0 45Q38 36 73 43t73-2t94-3V0H0Z" fill={night ? '#101633' : '#274969'}/>
      <path d="M0 45Q38 36 73 43t73-2t94-3" fill="none" stroke={cyan} strokeWidth="1.6"/>
      {night && !dry ? <path d="M189 9q-4 14 13 15-14 9-19-3-2-8 6-12" fill={light}/>
        : <path d="m12 43 31-3-25 103zm53 0 16 1-30 81z" fill="#83e7ff" opacity=".08"/>}
      {dry && <path d="M0 85q58-18 105-5t135-17v177H0Z" fill="#414461"/>}
      <Shore high={topic === 'nursing' || (iguana && topic === 'physiology')}/>
      {topic === 'observation' ? <g>
        <path d="m150 26-53 24 77-6z" fill={cyan} opacity=".24"/>
        <g transform="translate(145 24) rotate(18)" stroke={light}>
          <rect x="-7" y="-6" width="14" height="12" fill="#66799a"/><path d="M-31-5h19V5h-19zM12-5h19V5H12z" fill="#006EE9"/>
          <path d="M-24-4v8m6-8v8m36-8v8m7-8v8M-12 0h5m14 0h5"/>
        </g><text x="22" y="108" fill={light} fontSize="17">SST</text><text x="22" y="134" fill={cyan} fontSize="17">{es?'Clorofila-a':'Chlorophyll-a'}</text>
      </g> : mechanism ? <HabitatSection species={species}/> : topic === 'nursing' ? <g>
        <g transform="translate(34 41) rotate(-22 90 90)"><Animal species={species}/></g>
        <g transform="translate(182 116) scale(-.47 .47)"><Animal species={species}/></g>
      </g> : <>
        <g transform={iguana ? (topic==='physiology'?'translate(2 22)':'translate(2 44)') : benthic ? 'translate(1 19) rotate(9 85 86)' : 'translate(8 0) rotate(9 85 86)'}> {topic==='physiology' && species==='Spheniscus mendiculus' ? <g fill="#233859" stroke={light}><path d="M85 122q-12-8-12-28 0-20 11-40 6-18 19-16 11 0 12 11l12 5-14 4q-3 8 2 18 14 33-4 45l-12-1-9 3z"/><path d="M99 60q-10 22-7 43t15 17q14-14 4-37z" fill={light}/><path d="m86 75-7 35 11-10 5-25z" fill="#354c68"/><circle cx="108" cy="48" r="2" fill={light}/></g> : <Animal species={species}/>}</g>
        {feeding && (iguana ? <Algae/> : <g>{[[162,126,0.83],[185,112,0.77],[202,132,0.68],[169,145,0.65]].map(([x,y,scale])=><Fish key={x} x={x} y={benthic?y+14:y} scale={scale}/>)}</g>)}
        {feeding && night && <path d="M137 169q18-19 18-47m-6 8 6-9 5 9" stroke={pink} strokeWidth="2" fill="none"/>}
        {topic==='physiology' && (iguana ? <g stroke={pink} fill="none"><path d="m67 60 15 32m4-32 13 27m6-29 11 27"/><path d="M42 122q29-6 59 1" strokeWidth="3"/></g>
          : species==='Zalophus wollebaeki' ? <g><path d="M100 81q9-13 21-12-2 13-18 17z" fill={pink}/><path d="m107 85 33 36h24" fill="none" stroke={pink}/><text x="169" y="128" fill={light} fontSize="19">O₂</text></g>
          : <g stroke={cyan} fill="none"><path d="M40 123h137l-12 9H52zM84 133v13h47v-13"/><rect x="65" y="146" width="85" height="25" rx="4"/><text x="108" y="164" fill={light} stroke="none" textAnchor="middle" fontSize="14">kg</text></g>)}
      </>}
    </>}
    <path d="M16 196h208" stroke="#83e7ff" opacity=".36"/>
    <text x="16" y="221" fill={light} fontSize="16">{heading}</text>
  </svg>
}
